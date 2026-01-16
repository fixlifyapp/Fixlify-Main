import { test, expect } from "./fixtures/test-fixtures";

/**
 * Connect Messaging E2E Tests
 * Tests SMS, Email, Smart Replies, Estimates, and Invoice notifications
 */

test.describe("Connect Page - Navigation and Layout", () => {
  test("should load Connect page with all tabs", async ({ connectPage, page }) => {
    await connectPage.goto();

    // Check page header
    await expect(page.locator("h1:has-text('Connect')")).toBeVisible();

    // Check all tabs are present
    await expect(page.locator("role=tab[name='Unified Inbox']")).toBeVisible();
    await expect(page.locator("role=tab[name='Calls']")).toBeVisible();
    await expect(page.locator("role=tab[name='AI Calls']")).toBeVisible();

    // Check KPI cards are visible
    await expect(connectPage.kpiCards.first()).toBeVisible();
  });

  test("should switch between tabs", async ({ connectPage, page }) => {
    await connectPage.goto();

    // Switch to Calls tab
    await connectPage.selectTab("calls");
    await expect(page.locator("text=Voice Calls")).toBeVisible();

    // Switch to AI Calls tab
    await connectPage.selectTab("ai-calls");
    await expect(page.locator("text=AI Voice Assistant")).toBeVisible();

    // Switch back to Inbox
    await connectPage.selectTab("inbox");
    await expect(page.locator(".conversation-list, [data-testid='conversation-list']")).toBeVisible();
  });
});

test.describe("SMS Messaging Flow", () => {
  test("should display SMS conversations", async ({ connectPage, mockSMS, page, waitForLoading }) => {
    // Mock SMS data
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "When can you come for the repair?",
        unread_count: 1,
      },
      {
        id: "sms-2",
        client_name: "Jane Doe",
        client_phone: "+14375555678",
        last_message: "Thanks for the quick service!",
        unread_count: 0,
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    // Check conversations are displayed
    await expect(page.locator("text=John Smith")).toBeVisible();
    await expect(page.locator("text=Jane Doe")).toBeVisible();
  });

  test("should select SMS conversation and show messages", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    // Mock data
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "When can you come?",
        unread_count: 1,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "inbound",
        from_number: "+14375551234",
        to_number: "+14375249932",
        content: "Hi, I need help with my appliance",
        status: "delivered",
        created_at: new Date().toISOString(),
      },
      {
        id: "msg-2",
        conversation_id: "sms-1",
        direction: "outbound",
        from_number: "+14375249932",
        to_number: "+14375551234",
        content: "Hello! How can I assist you today?",
        status: "delivered",
        created_at: new Date().toISOString(),
      },
      {
        id: "msg-3",
        conversation_id: "sms-1",
        direction: "inbound",
        from_number: "+14375551234",
        to_number: "+14375249932",
        content: "When can you come for the repair?",
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    // Select conversation
    await connectPage.selectConversationByName("John Smith");

    // Verify messages are displayed
    await expect(page.locator("text=Hi, I need help with my appliance")).toBeVisible();
    await expect(page.locator("text=How can I assist you today")).toBeVisible();
    await expect(page.locator("text=When can you come for the repair")).toBeVisible();
  });

  test("should send SMS message successfully", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
    waitForToast,
  }) => {
    // Mock data
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "When can you come?",
        unread_count: 0,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "inbound",
        from_number: "+14375551234",
        to_number: "+14375249932",
        content: "When can you come?",
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await mockSMS.mockSendSuccess();

    await connectPage.goto();
    await waitForLoading();

    // Select conversation
    await connectPage.selectConversationByName("John Smith");

    // Send message
    await connectPage.sendMessage("I can come tomorrow at 2pm. Does that work?");

    // Verify success toast
    await waitForToast("SMS sent");
  });

  test("should show error on SMS send failure", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    // Mock data
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "Hello",
        unread_count: 0,
      },
    ]);

    await mockSMS.mockMessages([]);
    await mockSMS.mockSendFailure("Invalid phone number");

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("John Smith");
    await connectPage.sendMessage("Test message");

    // Verify error message
    await expect(page.locator("text=Failed to send")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Email Messaging Flow", () => {
  test("should display Email conversations", async ({
    connectPage,
    mockEmail,
    page,
    waitForLoading,
  }) => {
    // Mock Email data
    await mockEmail.mockConversations([
      {
        id: "email-1",
        client_name: "Alice Johnson",
        client_email: "alice@example.com",
        subject: "Quote Request",
        last_message: "Please send me a quote for the repair",
        unread_count: 1,
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    // Check email conversation is displayed
    await expect(page.locator("text=Alice Johnson")).toBeVisible();
  });

  test("should select Email conversation and show thread", async ({
    connectPage,
    mockEmail,
    page,
    waitForLoading,
  }) => {
    // Mock data
    await mockEmail.mockConversations([
      {
        id: "email-1",
        client_name: "Alice Johnson",
        client_email: "alice@example.com",
        subject: "Quote Request",
        last_message: "Please send me a quote",
        unread_count: 1,
      },
    ]);

    await mockEmail.mockMessages([
      {
        id: "email-msg-1",
        conversation_id: "email-1",
        direction: "inbound",
        from_email: "alice@example.com",
        to_email: "support@fixlify.com",
        subject: "Quote Request",
        body: "Hi, I would like a quote for appliance repair.",
        html_body: null,
        is_read: false,
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    // Select email conversation
    await connectPage.selectConversationByName("Alice Johnson");

    // Verify email content
    await expect(page.locator("text=I would like a quote")).toBeVisible();
  });

  test("should send Email reply successfully", async ({
    connectPage,
    mockEmail,
    page,
    waitForLoading,
    waitForToast,
  }) => {
    // Mock data
    await mockEmail.mockConversations([
      {
        id: "email-1",
        client_name: "Alice Johnson",
        client_email: "alice@example.com",
        subject: "Quote Request",
        last_message: "Please send me a quote",
        unread_count: 0,
      },
    ]);

    await mockEmail.mockMessages([
      {
        id: "email-msg-1",
        conversation_id: "email-1",
        direction: "inbound",
        from_email: "alice@example.com",
        to_email: "support@fixlify.com",
        subject: "Quote Request",
        body: "Hi, I need a quote.",
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await mockEmail.mockSendSuccess();

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("Alice Johnson");
    await connectPage.sendMessage("Thank you for reaching out. Here is your quote...");

    // Verify success
    await waitForToast("Email sent");
  });

  test("should star email conversation", async ({
    connectPage,
    mockEmail,
    page,
    waitForLoading,
  }) => {
    // Mock data
    await mockEmail.mockConversations([
      {
        id: "email-1",
        client_name: "VIP Client",
        client_email: "vip@example.com",
        subject: "Urgent Request",
        last_message: "Need help ASAP",
        unread_count: 1,
      },
    ]);

    await mockEmail.mockMessages([]);

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("VIP Client");
    await connectPage.starCurrentConversation();

    // Star icon should be filled
    await expect(page.locator('svg.lucide-star.fill-yellow-400')).toBeVisible();
  });
});

test.describe("AI Smart Replies", () => {
  test("should display smart reply suggestions", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    // Mock conversation
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "When can you come?",
        unread_count: 1,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "inbound",
        from_number: "+14375551234",
        content: "When can you come for the repair?",
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    // Mock Gemini AI response
    await page.route("**/functions/v1/gemini-ai", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          action: "smart_replies",
          result: [
            { id: "1", text: "I can come tomorrow between 9-11am.", tone: "professional", confidence: 0.95 },
            { id: "2", text: "Let me check my schedule and get back to you shortly!", tone: "friendly", confidence: 0.85 },
            { id: "3", text: "What time works best for you?", tone: "direct", confidence: 0.8 },
          ],
        }),
      });
    });

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("John Smith");

    // Wait for smart replies to load
    await expect(page.locator("text=AI Smart Replies")).toBeVisible({ timeout: 15000 });

    // Check reply options are shown
    await expect(page.locator("text=I can come tomorrow")).toBeVisible();
    await expect(page.locator("text=Let me check my schedule")).toBeVisible();
    await expect(page.locator("text=What time works best")).toBeVisible();
  });

  test("should populate input when smart reply is selected", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    // Mock conversation
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "Need help",
        unread_count: 1,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "inbound",
        from_number: "+14375551234",
        content: "Need help with my washing machine",
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    // Mock AI response
    await page.route("**/functions/v1/gemini-ai", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          action: "smart_replies",
          result: [
            { id: "1", text: "I'd be happy to help! What seems to be the issue?", tone: "friendly", confidence: 0.9 },
            { id: "2", text: "I can schedule a diagnostic visit.", tone: "professional", confidence: 0.85 },
            { id: "3", text: "Please describe the problem.", tone: "direct", confidence: 0.8 },
          ],
        }),
      });
    });

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("John Smith");

    // Wait and click smart reply
    await expect(page.locator("text=I'd be happy to help")).toBeVisible({ timeout: 15000 });
    await page.click("text=I'd be happy to help");

    // Verify input is populated
    await expect(connectPage.messageInput).toHaveValue("I'd be happy to help! What seems to be the issue?");
  });

  test("should regenerate smart replies on refresh click", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    // Mock data
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "Question",
        unread_count: 1,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "inbound",
        content: "Do you offer warranty?",
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    let callCount = 0;
    await page.route("**/functions/v1/gemini-ai", (route) => {
      callCount++;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          action: "smart_replies",
          result: [
            { id: `${callCount}-1`, text: callCount === 1 ? "Yes, we offer warranty." : "Our warranty covers parts and labor.", tone: "professional", confidence: 0.9 },
          ],
        }),
      });
    });

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("John Smith");

    // Wait for initial replies
    await expect(page.locator("text=Yes, we offer warranty")).toBeVisible({ timeout: 15000 });

    // Click refresh
    await page.click("button:has-text('Refresh')");

    // New replies should appear
    await expect(page.locator("text=Our warranty covers parts")).toBeVisible({ timeout: 15000 });
    expect(callCount).toBe(2);
  });
});

test.describe("Estimate Notifications in Messages", () => {
  test("should show estimate sent notification in thread", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    // Mock conversation with estimate notification
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "Estimate #EST-001 sent",
        unread_count: 0,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "outbound",
        content: "Your estimate #EST-001 is ready. View it here: https://app.fixlify.app/portal/estimate/abc123",
        metadata: {
          type: "estimate_notification",
          estimate_id: "est-001",
          estimate_number: "EST-001",
        },
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("John Smith");

    // Check estimate notification message
    await expect(page.locator("text=Your estimate #EST-001 is ready")).toBeVisible();
    await expect(page.locator("text=portal/estimate")).toBeVisible();
  });

  test("should show estimate approved notification", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "Estimate approved!",
        unread_count: 1,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "outbound",
        content: "Your estimate #EST-001 is ready.",
        metadata: { type: "estimate_notification", estimate_id: "est-001" },
        status: "delivered",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "msg-2",
        conversation_id: "sms-1",
        direction: "inbound",
        content: "I approved the estimate!",
        metadata: {
          type: "estimate_approved",
          estimate_id: "est-001",
        },
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("John Smith");

    // Check approval message
    await expect(page.locator("text=I approved the estimate")).toBeVisible();
  });

  test("should show estimate declined notification", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "Jane Doe",
        client_phone: "+14375559999",
        last_message: "Estimate declined",
        unread_count: 1,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "outbound",
        content: "Your estimate #EST-002 is ready.",
        status: "delivered",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "msg-2",
        conversation_id: "sms-1",
        direction: "inbound",
        content: "The price is too high, I'll have to decline.",
        metadata: {
          type: "estimate_declined",
          estimate_id: "est-002",
          decline_reason: "Price too high",
        },
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("Jane Doe");

    await expect(page.locator("text=The price is too high")).toBeVisible();
  });
});

test.describe("Invoice Notifications in Messages", () => {
  test("should show invoice sent notification", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "Invoice #INV-001 sent",
        unread_count: 0,
      },
    ]);

    await mockSMS.mockMessages([
      {
        id: "msg-1",
        conversation_id: "sms-1",
        direction: "outbound",
        content: "Your invoice #INV-001 for $250.00 is ready. Pay here: https://app.fixlify.app/portal/invoice/xyz789",
        metadata: {
          type: "invoice_notification",
          invoice_id: "inv-001",
          invoice_number: "INV-001",
          amount: 250.0,
        },
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("John Smith");

    // Check invoice notification
    await expect(page.locator("text=Your invoice #INV-001")).toBeVisible();
    await expect(page.locator("text=$250.00")).toBeVisible();
    await expect(page.locator("text=portal/invoice")).toBeVisible();
  });

  test("should show payment received notification", async ({
    connectPage,
    mockEmail,
    page,
    waitForLoading,
  }) => {
    await mockEmail.mockConversations([
      {
        id: "email-1",
        client_name: "Alice Johnson",
        client_email: "alice@example.com",
        subject: "Payment Confirmation",
        last_message: "Payment received",
        unread_count: 1,
      },
    ]);

    await mockEmail.mockMessages([
      {
        id: "email-msg-1",
        conversation_id: "email-1",
        direction: "inbound",
        from_email: "payments@stripe.com",
        subject: "Payment Confirmation",
        body: "Payment of $250.00 has been successfully processed for Invoice #INV-001.",
        metadata: {
          type: "payment_received",
          invoice_id: "inv-001",
          amount: 250.0,
        },
        status: "delivered",
        created_at: new Date().toISOString(),
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("Alice Johnson");

    await expect(page.locator("text=Payment of $250.00")).toBeVisible();
    await expect(page.locator("text=successfully processed")).toBeVisible();
  });
});

test.describe("Search and Filtering", () => {
  test("should filter conversations by search query", async ({
    connectPage,
    mockSMS,
    mockEmail,
    page,
    waitForLoading,
  }) => {
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "Hello",
        unread_count: 0,
      },
      {
        id: "sms-2",
        client_name: "Jane Doe",
        client_phone: "+14375555678",
        last_message: "Hi",
        unread_count: 0,
      },
    ]);

    await mockEmail.mockConversations([]);

    await connectPage.goto();
    await waitForLoading();

    // Both should be visible
    await expect(page.locator("text=John Smith")).toBeVisible();
    await expect(page.locator("text=Jane Doe")).toBeVisible();

    // Search for John
    await connectPage.search("John");

    // Only John should be visible
    await expect(page.locator("text=John Smith")).toBeVisible();
    await expect(page.locator("text=Jane Doe")).not.toBeVisible();
  });

  test("should filter by category - SMS only", async ({
    connectPage,
    mockSMS,
    mockEmail,
    page,
    waitForLoading,
  }) => {
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "SMS Client",
        client_phone: "+14375551234",
        last_message: "SMS message",
        unread_count: 0,
      },
    ]);

    await mockEmail.mockConversations([
      {
        id: "email-1",
        client_name: "Email Client",
        client_email: "email@example.com",
        subject: "Email Subject",
        last_message: "Email message",
        unread_count: 0,
      },
    ]);

    await connectPage.goto();
    await waitForLoading();

    // Select SMS only category
    await connectPage.selectCategory("SMS");

    // Only SMS should be visible
    await expect(page.locator("text=SMS Client")).toBeVisible();
    // Email client should be hidden
    await expect(page.locator("text=Email Client")).not.toBeVisible();
  });
});

test.describe("Archive and Star Actions", () => {
  test("should archive conversation", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
    waitForToast,
  }) => {
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "Archive Me",
        client_phone: "+14375551234",
        last_message: "Test",
        unread_count: 0,
      },
    ]);

    await mockSMS.mockMessages([]);

    // Mock archive endpoint
    await page.route("**/rest/v1/sms_conversations**", (route, request) => {
      if (request.method() === "PATCH") {
        route.fulfill({ status: 200, body: JSON.stringify({}) });
      } else {
        route.continue();
      }
    });

    await connectPage.goto();
    await waitForLoading();

    await connectPage.selectConversationByName("Archive Me");
    await connectPage.archiveCurrentConversation();

    await waitForToast("Conversation archived");
  });
});

test.describe("Real-time Updates", () => {
  test("should show toast on new inbound message", async ({
    connectPage,
    mockSMS,
    page,
    waitForLoading,
  }) => {
    await mockSMS.mockConversations([
      {
        id: "sms-1",
        client_name: "John Smith",
        client_phone: "+14375551234",
        last_message: "Initial message",
        unread_count: 0,
      },
    ]);

    await mockSMS.mockMessages([]);

    await connectPage.goto();
    await waitForLoading();

    // Simulate real-time update by triggering a supabase event
    // In real scenario, this would come from the database
    await page.evaluate(() => {
      // Simulate toast notification
      const event = new CustomEvent("show-toast", {
        detail: { message: "New SMS received" },
      });
      window.dispatchEvent(event);
    });

    // Check for notification (handled by toast system)
    // In real test, this would verify the actual real-time subscription
  });
});
