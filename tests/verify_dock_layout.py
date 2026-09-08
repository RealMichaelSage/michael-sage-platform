#!/usr/bin/env python3
import time
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

WORKSPACE_DIR = Path("/Users/michaelsage/Desktop/Vibes/Sites/michael-sage-platform").resolve()
ARTIFACTS_DIR = Path("/Users/michaelsage/.gemini/antigravity/brain/daf018ce-d1bd-4544-a76b-70a0903bb6bd").resolve()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class QuietHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WORKSPACE_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def main():
    server = ReusableTCPServer(("127.0.0.1", 0), QuietHTTPHandler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{port}/cabinet.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ── 1. WIDESCREEN 1920x1080 (Mikhail's Desktop Monitor) ──
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # Inject logged-in user state (Mikhail Sage)
        page.add_init_script("""
            localStorage.setItem('asage_user', JSON.stringify({
                telegram_id: '439634804',
                id: '439634804',
                first_name: 'Михаил',
                last_name: 'Пузырёв',
                username: 'Michael_Sage',
                role: 'founder',
                bio: 'Архитектор ИИ-систем, предприниматель, автор платформы SAGE. Внедрение AI-агентов и LLM в реальный сектор бизнеса.',
                email: 'i@michaelpuzyrev.ru',
                channel_url: '@Michael_Sage',
                website_url: 'https://michaelpuzyrev.ru',
                photo_url: '/img/mikhail_hero.jpg'
            }));
            localStorage.setItem('sage_club_access', 'true');
        """)

        page.goto(base_url, wait_until="networkidle")
        time.sleep(0.5)

        # Verify left dock visibility and position
        dock = page.locator("#cabinet-left-dock")
        header = page.locator(".cabinet-header-block")
        frame = page.locator(".cabinet-page-frame")

        dock_visible = dock.is_visible()
        header_visible = header.is_visible()
        dock_box = dock.bounding_box()
        frame_box = frame.bounding_box()

        print(f"[1920x1080] Dock visible: {dock_visible}")
        print(f"[1920x1080] Header visible: {header_visible}")
        print(f"[1920x1080] Dock box: {dock_box}")
        print(f"[1920x1080] Frame box: {frame_box}")

        assert dock_visible, "Left dock must be visible on 1920px screen"
        assert not header_visible, "Header block must be hidden on 1920px screen when logged in"
        assert frame_box["width"] == 1440, f"Central frame width must be 1440px, got {frame_box['width']}"
        assert dock_box["x"] > 0, "Dock must be positioned on the screen"
        assert dock_box["x"] + dock_box["width"] < frame_box["x"], "Dock must be strictly to the left of the 1440px frame"

        # Screenshot top
        top_shot = ARTIFACTS_DIR / "cabinet_1920_dock_top.png"
        page.screenshot(path=str(top_shot))
        print(f"Saved: {top_shot}")

        # Scroll down and verify fixed position
        page.evaluate("window.scrollBy(0, 600)")
        time.sleep(0.3)
        dock_box_scrolled = dock.bounding_box()
        print(f"[1920x1080 Scrolled] Dock Y: {dock_box_scrolled['y']}")
        assert abs(dock_box_scrolled["y"] - dock_box["y"]) < 2, "Dock must remain fixed during scroll"

        scrolled_shot = ARTIFACTS_DIR / "cabinet_1920_dock_scrolled.png"
        page.screenshot(path=str(scrolled_shot))
        print(f"Saved: {scrolled_shot}")

        # Test Profile tab switch and live preview in dock
        page.click(".cabinet-tab-btn[data-tab='profile']")
        time.sleep(0.3)
        page.fill("#inp-first-name", "Михаил")
        page.fill("#inp-last-name", "Саж (Тест)")
        page.fill("#inp-bio", "Обновленное био в реальном времени!")
        time.sleep(0.2)

        dock_name_text = page.locator("#dock-display-name").inner_text()
        dock_bio_text = page.locator("#dock-bio-wrap").inner_text()
        print(f"Dock live name: {dock_name_text}")
        print(f"Dock live bio: {dock_bio_text}")
        assert "Михаил Саж (Тест)" in dock_name_text, "Live preview must sync to dock"

        profile_shot = ARTIFACTS_DIR / "cabinet_1920_dock_profile_edit.png"
        page.screenshot(path=str(profile_shot))
        print(f"Saved: {profile_shot}")

        context.close()

        # ── 2. LAPTOP 1440x900 (Fallback: Dock hidden, Header block visible) ──
        context_laptop = browser.new_context(viewport={"width": 1440, "height": 900})
        page_laptop = context_laptop.new_page()
        page_laptop.add_init_script("""
            localStorage.setItem('asage_user', JSON.stringify({
                telegram_id: '439634804',
                first_name: 'Михаил',
                last_name: 'Пузырёв',
                username: 'Michael_Sage',
                role: 'founder',
                bio: 'Архитектор ИИ-систем'
            }));
        """)
        page_laptop.goto(base_url, wait_until="networkidle")
        time.sleep(0.3)

        laptop_dock = page_laptop.locator("#cabinet-left-dock")
        laptop_header = page_laptop.locator(".cabinet-header-block")
        assert not laptop_dock.is_visible(), "Dock must be hidden on 1440px laptop"
        assert laptop_header.is_visible(), "Header block must be visible on 1440px laptop"

        laptop_shot = ARTIFACTS_DIR / "cabinet_1440_fallback.png"
        page_laptop.screenshot(path=str(laptop_shot))
        print(f"Saved: {laptop_shot}")
        context_laptop.close()

        # ── 3. MOBILE 375x812 (Mobile Viewport) ──
        context_mobile = browser.new_context(viewport={"width": 375, "height": 812}, is_mobile=True)
        page_mobile = context_mobile.new_page()
        page_mobile.add_init_script("""
            localStorage.setItem('asage_user', JSON.stringify({
                telegram_id: '439634804',
                first_name: 'Михаил',
                last_name: 'Пузырёв',
                username: 'Michael_Sage',
                role: 'founder'
            }));
        """)
        page_mobile.goto(base_url, wait_until="networkidle")
        time.sleep(0.3)

        mobile_dock = page_mobile.locator("#cabinet-left-dock")
        mobile_header = page_mobile.locator(".cabinet-header-block")
        assert not mobile_dock.is_visible(), "Dock must be hidden on mobile"
        assert mobile_header.is_visible(), "Header must be visible on mobile"

        mobile_shot = ARTIFACTS_DIR / "cabinet_375_mobile_dock.png"
        page_mobile.screenshot(path=str(mobile_shot))
        print(f"Saved: {mobile_shot}")
        context_mobile.close()

        browser.close()

    server.shutdown()
    server.server_close()
    print("ALL DOCK LAYOUT VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
