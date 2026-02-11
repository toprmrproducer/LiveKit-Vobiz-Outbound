
(function () {
    var config = {
        position: 'bottom-right', // bottom-right, bottom-left
        width: '350px',
        height: '500px',
        url: window.location.origin + '/widget', // Assumes widget is on the same domain, or hardcode your full URL
    };

    // Find the script element to check for custom config attributes if needed
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];

    // Create Iframe Container
    var container = document.createElement('div');
    container.id = 'rapid-x-voice-widget';
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.width = '60px'; // Start small (FAB size)
    container.style.height = '60px'; // Start small
    container.style.transition = 'all 0.3s ease';

    var iframe = document.createElement('iframe');
    iframe.src = config.url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '30px'; // Rounded when small
    iframe.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
    iframe.allow = "microphone"; // Critical for voice

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Message listener to resize iframe based on widget state
    window.addEventListener('message', function (event) {
        if (event.data === 'widget-open') {
            container.style.width = config.width;
            container.style.height = config.height;
            iframe.style.borderRadius = '16px';
        } else if (event.data === 'widget-close') {
            container.style.width = '60px';
            container.style.height = '60px';
            iframe.style.borderRadius = '30px';
        }
    });
})();
