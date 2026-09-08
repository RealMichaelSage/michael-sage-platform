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

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ── 1. TEST NON-SUBSCRIBED USER (Compelling Offer in Profile) ──
        context_free = browser.new_context(viewport={"width": 1440, "height": 900})
        page_free = context_free.new_page()
        page_free.add_init_script("""
            localStorage.setItem('asage_user', JSON.stringify({
                telegram_id: '999123456',
                first_name: 'Иван',
                last_name: 'Петров',
                username: 'ivan_free',
                role: 'user'
            }));
            localStorage.removeItem('sage_club_access');
        """)
        page_free.goto(f"http://127.0.0.1:{port}/cabinet.html", wait_until="networkidle")
        time.sleep(0.3)

        # Switch to Profile Tab
        page_free.click(".cabinet-tab-btn[data-tab='profile']")
        time.sleep(0.3)

        inactive_block = page_free.locator("#subscription-status-inactive")
        active_block = page_free.locator("#subscription-status-active")

        assert inactive_block.is_visible(), "Non-subscribed user must see offer block"
        assert not active_block.is_visible(), "Active subscription block must be hidden for non-subscriber"

        inactive_text = inactive_block.inner_text().replace('\xa0', ' ')
        print("--- Non-Subscriber Block Text ---")
        print(inactive_text)

        assert "SAGE NEURO FAMILY" in inactive_text
        assert "База Знаний PRO" in inactive_text
        assert "Все видео-уроки и воркшопы" in inactive_text
        assert "Закрытый Telegram-чат резидентов" in inactive_text
        assert "Еженедельные онлайн-мастермайнда" not in inactive_text
        assert "Специальные условия" in inactive_text

        # Verify button text DOES NOT contain "Tribute"
        btn = inactive_block.locator("a.btn-primary")
        btn_text = btn.inner_text()
        print(f"Non-subscriber CTA button text: '{btn_text}'")
        btn_text_clean = btn_text.replace('\xa0', ' ').lower()
        assert "tribute" not in btn_text_clean, f"CTA button must not mention Tribute, got '{btn_text}'"
        assert "вступить в клуб" in btn_text_clean

        # Verify offer link
        offer_link = inactive_block.locator("a[href*='offer']")
        assert offer_link.is_visible(), "Offer link must be present"

        # Scroll to block and take focused screenshot
        page_free.locator("#cabinet-subscription-block").scroll_into_view_if_needed()
        time.sleep(0.3)
        shot_offer = ARTIFACTS_DIR / "cabinet_profile_offer_non_subscriber.png"
        page_free.locator("#cabinet-subscription-block").screenshot(path=str(shot_offer))
        print(f"Saved: {shot_offer}")
        context_free.close()

        # ── 2. TEST ACTIVE SUBSCRIBER (Manage Subscription Block) ──
        context_club = browser.new_context(viewport={"width": 1440, "height": 900})
        page_club = context_club.new_page()
        page_club.add_init_script("""
            localStorage.setItem('asage_user', JSON.stringify({
                telegram_id: '439634804',
                first_name: 'Михаил',
                last_name: 'Пузырёв',
                username: 'Michael_Sage',
                role: 'founder'
            }));
            localStorage.setItem('sage_club_access', 'true');
        """)
        page_club.goto(f"http://127.0.0.1:{port}/cabinet.html", wait_until="networkidle")
        time.sleep(0.3)

        page_club.click(".cabinet-tab-btn[data-tab='profile']")
        time.sleep(0.3)

        club_inactive = page_club.locator("#subscription-status-inactive")
        club_active = page_club.locator("#subscription-status-active")

        assert club_active.is_visible(), "Subscribed user must see active management block"
        assert not club_inactive.is_visible(), "Offer block must be hidden for active subscriber"

        club_text = club_active.inner_text().replace('\xa0', ' ')
        print("--- Active Subscriber Block Text ---")
        print(club_text)
        assert "Управление подпиской SAGE NEURO FAMILY" in club_text

        # Verify button text DOES NOT contain "Tribute"
        manage_btn = club_active.locator("a.btn-secondary")
        manage_btn_text = manage_btn.inner_text()
        manage_btn_clean = manage_btn_text.replace('\xa0', ' ').lower()
        print(f"Active subscriber button text: '{manage_btn_text}'")
        assert "tribute" not in manage_btn_clean, f"Manage button must not mention Tribute, got '{manage_btn_text}'"
        assert "управление подпиской" in manage_btn_clean

        page_club.locator("#cabinet-subscription-block").scroll_into_view_if_needed()
        time.sleep(0.3)
        shot_active = ARTIFACTS_DIR / "cabinet_profile_manage_subscriber.png"
        page_club.locator("#cabinet-subscription-block").screenshot(path=str(shot_active))
        print(f"Saved: {shot_active}")
        context_club.close()

        # ── 3. TEST OFFER.HTML PAGE ──
        context_offer = browser.new_context(viewport={"width": 1440, "height": 1000})
        page_offer = context_offer.new_page()
        page_offer.goto(f"http://127.0.0.1:{port}/offer.html", wait_until="networkidle")
        time.sleep(0.3)

        offer_title = page_offer.title()
        assert "Публичная оферта Закрытого Клуба SAGE NEURO FAMILY" in offer_title

        offer_content = page_offer.locator("main").inner_text().replace('\xa0', ' ')
        assert "Tribute" in offer_content, "Offer must mention payment via Tribute"
        assert "сервис Tribute" in offer_content
        assert "PCI DSS" in offer_content
        assert "1 900" in offer_content
        assert "1 500" in offer_content

        shot_legal = ARTIFACTS_DIR / "offer_club_page.png"
        page_offer.screenshot(path=str(shot_legal))
        print(f"Saved: {shot_legal}")
        context_offer.close()

        browser.close()

    server.shutdown()
    server.server_close()
    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
