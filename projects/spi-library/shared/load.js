try {
    window.uxp = require('uxp');
    window.host = uxp.host.name;
    switch (host) {
        case 'InDesign':
            window.indesign = require('indesign');
            break;
        case 'Photoshop':
            window.photoshop = require('photoshop');
            break;
    }
} catch (_) {
    console.error('Attempted to load UXP api outside UXP application');
}
