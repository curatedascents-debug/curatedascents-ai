/** Shared selectors used across page objects and tests */

export const SELECTORS = {
  // Navigation
  nav: {
    logo: 'text=CuratedAscents',
    chatButton: 'text=Plan Your Journey',
    blogLink: 'text=Blog',
  },

  // Chat widget
  chat: {
    floatingButton: '[class*="fixed"][class*="bottom-"][class*="right-"]',
    container: '[class*="chat"]',
    messageInput: 'textarea, input[type="text"][placeholder*="message"], input[placeholder*="adventure"]',
    sendButton: 'button[type="submit"]',
    userMessage: '[class*="bg-emerald-600"]',
    assistantMessage: '[class*="bg-slate-800"][class*="border-slate-700"]',
    loadingIndicator: '[class*="animate-"]',
    emailInput: 'input[placeholder="Your email"]',
    nameInput: 'input[placeholder="Your name"]',
    skipButton: 'text=Skip for now',
    continueButton: 'text=Continue',
  },

  // Admin
  admin: {
    passwordInput: 'input[type="password"]',
    loginButton: 'button[type="submit"]',
    logoutButton: 'button:has(svg)',
    tabContainer: '[class*="flex"][class*="gap"]',
    statsCard: '[class*="bg-slate-800"][class*="rounded"]',
    table: 'table',
    tableRow: 'tbody tr',
    createButton: 'text=Create',
    saveButton: 'text=Save',
    deleteButton: 'text=Delete',
    modal: '[class*="fixed"][class*="inset-0"]',
    searchInput: 'input[placeholder*="Search"]',
  },

  // Agency
  agency: {
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    loginButton: 'button[type="submit"]',
    dashboardTitle: 'text=Agency Dashboard',
  },

  // Supplier
  supplier: {
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    loginButton: 'button[type="submit"]',
  },

  // Portal
  portal: {
    emailInput: 'input[type="email"]',
    codeInput: 'input[inputmode="numeric"]',
    sendCodeButton: 'text=Send Verification Code',
    verifyButton: 'text=Verify',
    resendButton: 'text=Resend',
    changeEmailButton: 'text=Change email',
  },

  // Blog
  blog: {
    postCard: '[class*="bg-slate-800"][class*="rounded"]',
    categoryButton: 'button[class*="rounded"]',
    loadMoreButton: 'text=Load More',
    postTitle: 'h1',
    postContent: '[class*="prose"]',
    backButton: 'text=Back',
    shareButton: '[class*="share"]',
  },

  // Generic
  loadingSpinner: '[class*="animate-spin"]',
  errorMessage: '[class*="text-red"]',
  successMessage: '[class*="text-emerald"], [class*="text-green"]',
  badge: '[class*="rounded-full"][class*="px-"]',
  modal: '[class*="fixed"][class*="inset-0"][class*="z-50"]',
};
