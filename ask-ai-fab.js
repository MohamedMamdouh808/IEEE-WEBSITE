// Floating Ask AI FAB injected across pages
(function () {
  try {
    // Ensure Font Awesome is present (for the robot icon)
    var hasFA = !!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]');
    if (!hasFA) {
      var fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
      document.head.appendChild(fa);
    }

    // Compute absolute path to the AI page inside the `ieee` folder
    var path = window.location.pathname.replace(/\\/g, '/');
    var idx = path.lastIndexOf('/ieee/');
    var base = idx >= 0 ? path.substring(0, idx + 6) : '/ieee/';
    var aiHref = base + 'AI assistant/ai.html';

    // Inject styles
    var style = document.createElement('style');
    style.textContent = (
      '.ask-ai-fab{position:fixed;right:20px;bottom:20px;width:58px;height:58px;border-radius:50%;'+
      'display:flex;align-items:center;justify-content:center;z-index:9999;'+
      'background:linear-gradient(135deg,#00e6ff,#0099ff);box-shadow:0 10px 20px rgba(0,0,0,.15);'+
      'color:#fff;text-decoration:none;transition:transform .2s ease, box-shadow .2s ease}'+
      '.ask-ai-fab:hover{transform:translateY(-3px);box-shadow:0 14px 28px rgba(0,0,0,.18)}'+
      '.ask-ai-fab i{font-size:22px;line-height:1}'+
      '@media (max-width:480px){.ask-ai-fab{right:14px;bottom:14px;width:54px;height:54px}}'+
      'nav .ask-ai-btn{display:none !important}'
    );
    document.head.appendChild(style);

    // Create FAB
    var fab = document.createElement('a');
    fab.href = aiHref;
    fab.className = 'ask-ai-fab';
    fab.setAttribute('aria-label', 'Ask AI');
    fab.innerHTML = '<i class="fa-solid fa-robot"></i>';
    document.body.appendChild(fab);
  } catch (e) {
    console && console.warn && console.warn('Ask AI FAB init failed:', e);
  }
})();


