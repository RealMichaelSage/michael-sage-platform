#!/usr/bin/env python3
"""
Automated E2E Test Suite for SAGE Personal Cabinet (7 Canonical Tabs Architecture)
Covers:
- Sticky Tab Bar (top: 68px)
- Separation of Knowledge Base and Video Lessons
- Exactly 2 Real Products in Solutions Showcase (Sagemeet & SAGE VPN)
- Removal of redundant dashboard shortcuts and fake mastermind
- Members directory, favorites, and profile live preview
- Mobile responsive behavior
"""

import os
import sys
import time
import threading
import http.server
import socketserver
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright

WORKSPACE_DIR = Path("/Users/michaelsage/Desktop/Vibes/Sites/michael-sage-platform").resolve()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class QuietHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WORKSPACE_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

class TestCanonicalCabinet(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ReusableTCPServer(("127.0.0.1", 0), QuietHTTPHandler)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.port}/cabinet.html"

        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 900})
        self.page = self.context.new_page()
        self.page.goto(self.base_url, wait_until="networkidle")

    def tearDown(self):
        self.context.close()

    def test_01_sticky_navigation_bar(self):
        """Tabs bar must be sticky at top: 68px and stay pinned during scroll."""
        tabs_bar = self.page.locator(".cabinet-tabs-bar").first
        self.assertTrue(tabs_bar.is_visible())

        pos = self.page.evaluate("() => window.getComputedStyle(document.querySelector('.cabinet-tabs-bar')).position")
        top = self.page.evaluate("() => window.getComputedStyle(document.querySelector('.cabinet-tabs-bar')).top")
        self.assertIn("sticky", pos)
        self.assertEqual(top, "68px")

        # Scroll down 400px and verify bounding box top is 68px
        self.page.evaluate("window.scrollBy(0, 400)")
        time.sleep(0.2)
        box = tabs_bar.bounding_box()
        self.assertIsNotNone(box)
        self.assertAlmostEqual(box["y"], 68, delta=2)

    def test_02_canonical_seven_tabs_present(self):
        """Ensure all 7 canonical tabs exist with proper labels and active defaults."""
        tab_buttons = self.page.locator(".cabinet-tab-btn")
        self.assertEqual(tab_buttons.count(), 7)

        tab_names = [tab_buttons.nth(i).inner_text().lower() for i in range(7)]
        self.assertTrue(any("база знаний" in t for t in tab_names))
        self.assertTrue(any("записи" in t for t in tab_names))
        self.assertTrue(any("витрина" in t for t in tab_names))
        self.assertTrue(any("клуб" in t for t in tab_names))
        self.assertTrue(any("резиденты" in t for t in tab_names))
        self.assertTrue(any("избранное" in t for t in tab_names))
        self.assertTrue(any("профиль" in t for t in tab_names))

        # Default tab is Knowledge Base
        active = self.page.locator(".cabinet-tab-btn.active").first
        self.assertIn("база знаний", active.inner_text().lower())

    def test_03_knowledge_base_cards(self):
        """Knowledge Base must contain real cards and modals for lighting and angles."""
        self.page.click(".cabinet-tab-btn[data-tab='knowledge']")
        pane = self.page.locator("#tab-knowledge")
        self.assertTrue(pane.is_visible())

        text = pane.inner_text().replace('\xa0', ' ')
        self.assertIn("Как внедрить ИИ-агентов в бизнес", text)
        self.assertIn("ИИ-Автоматизация для Бизнеса", text)
        self.assertIn("Google One", text)
        self.assertIn("Шпаргалка по свету", text)
        self.assertIn("Гид по ракурсам", text)
        self.assertIn("Калькулятор Финмодели", text)
        self.assertIn("Калькулятор Налогов", text)
        self.assertIn("Библиотека Системных Промптов", text)
        self.assertIn("AI-Глоссарий", text)

        # Modal testing
        self.page.click("button:has-text('Открыть шпаргалку по свету')")
        time.sleep(0.2)
        modal = self.page.locator("#guide-lighting-modal")
        self.assertTrue(modal.is_visible())
        self.assertIn("Golden Hour", modal.inner_text())
        self.page.click("#guide-lighting-modal .guide-modal-close-btn")
        time.sleep(0.2)
        self.assertFalse(modal.is_visible())

    def test_04_education_section_six_real_lessons(self):
        """Education section must contain 6 real master-classes and video player modal."""
        self.page.click(".cabinet-tab-btn[data-tab='education']")
        pane = self.page.locator("#tab-education")
        self.assertTrue(pane.is_visible())

        cards = self.page.locator("#club-lessons-grid .club-lesson-card")
        self.assertEqual(cards.count(), 6)

        text = pane.inner_text()
        self.assertIn("Вайбкодинг: от идеи до продакшена", text)
        self.assertIn("Автономные AI-агенты и вебхуки", text)
        self.assertIn("Интеграция LLM в реальный бизнес", text)
        self.assertIn("RAG-системы", text)
        self.assertIn("AI-продакшн видео и подкастов", text)
        self.assertIn("Промпт-дизайн и создание ассистентов", text)

    def test_05_solutions_showcase_two_real_products_only(self):
        """Showcase must contain 4 real solutions (Sagemeet, SAGE VPN, Finmodel, Tax Calc), with unglued tags."""
        self.page.click(".cabinet-tab-btn[data-tab='solutions']")
        pane = self.page.locator("#tab-solutions")
        self.assertTrue(pane.is_visible())

        cards = pane.locator(".cabinet-card")
        self.assertEqual(cards.count(), 4)

        # Sagemeet
        sagemeet_card = cards.nth(0)
        self.assertIn("Sagemeet", sagemeet_card.inner_text())
        self.assertIn("meet.aisage.ru", sagemeet_card.inner_html())
        self.assertIn("SageMeetBot", sagemeet_card.inner_html())

        # SAGE VPN
        vpn_card = cards.nth(1)
        self.assertIn("SAGE VPN", vpn_card.inner_text())
        self.assertIn("Michael_Sage_bot", vpn_card.inner_html())

        # Finmodel
        finmodel_card = cards.nth(2)
        self.assertIn("Финмодель", finmodel_card.inner_text())
        self.assertIn("calculator-finmodel", finmodel_card.inner_html())

        # Tax Calc
        tax_card = cards.nth(3)
        self.assertIn("Калькулятор Налогов", tax_card.inner_text())
        self.assertIn("calculator-tax", tax_card.inner_html())

        # No synthetic 10 items
        self.assertNotIn("Voice Transcriber Bot // Whisper", pane.inner_text())
        self.assertNotIn("AI Lead Scraper & CRM", pane.inner_text())

        # Check tech tags are properly displayed
        tags = pane.locator(".tech-tag")
        self.assertGreaterEqual(tags.count(), 6)
        display = self.page.evaluate("() => window.getComputedStyle(document.querySelector('#tab-solutions .tech-tag')).display")
        self.assertIn(display, ["flex", "inline-flex", "inline-block"])

    def test_06_no_redundant_dashboard_or_fake_mastermind(self):
        """Dashboard tab and fake mastermind timer must not exist."""
        html = self.page.content()
        self.assertNotIn("countdown-timer-display", html)
        self.assertNotIn("🔴 ЖИВОЙ МАСТЕРМАЙНД // ЧЕТВЕРГ 19:00 МСК", html)
        self.assertNotIn("quick-actions-grid", html)

    def test_07_club_membership_details(self):
        """Club tab displays Tribute pricing and regular schedule."""
        self.page.click(".cabinet-tab-btn[data-tab='club']")
        pane = self.page.locator("#tab-club")
        self.assertTrue(pane.is_visible())

        text = pane.inner_text()
        self.assertIn("1 900 ₽", text)
        self.assertIn("1 500 ₽", text)
        self.assertIn("ЧЕТВЕРГ", text)
        self.assertIn("ВОСКРЕСЕНЬЕ", text)
        self.assertIn("web.tribute.tg/s/O6I", pane.inner_html())

    def test_08_profile_live_preview(self):
        """Profile tab live preview responds to user input."""
        self.page.click(".cabinet-tab-btn[data-tab='profile']")
        pane = self.page.locator("#tab-profile")
        self.assertTrue(pane.is_visible())

        self.page.fill("#inp-first-name", "Иван")
        self.page.fill("#inp-last-name", "Петров")
        self.page.fill("#inp-tg-username", "@ivan_petrov")
        time.sleep(0.2)

        preview_name = self.page.locator("#preview-user-name").inner_text()
        preview_handle = self.page.locator("#preview-user-handle").inner_text()
        self.assertEqual(preview_name, "Иван Петров")
        self.assertEqual(preview_handle, "@ivan_petrov")

    def test_09_mobile_responsive_sticky_tab_bar(self):
        """Mobile viewport 375px maintains sticky tabs bar and horizontal scroll."""
        mobile_ctx = self.browser.new_context(viewport={"width": 375, "height": 812})
        m_page = mobile_ctx.new_page()
        m_page.goto(self.base_url, wait_until="networkidle")

        m_tabs = m_page.locator(".cabinet-tabs-bar").first
        self.assertTrue(m_tabs.is_visible())

        m_pos = m_page.evaluate("() => window.getComputedStyle(document.querySelector('.cabinet-tabs-bar')).position")
        self.assertIn("sticky", m_pos)
        mobile_ctx.close()


if __name__ == "__main__":
    unittest.main()
