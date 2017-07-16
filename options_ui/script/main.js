
var el;

function getRules(_cb){
    browser.storage.local
    .get('rules')
    .then(function(_data){
        if (_data) _cb(_data.rules || []);
    });
}

function setRules(_rules, _ok, _ko){
    browser.storage.local
    .set({ rules: _rules })
    .then(_ok, _ko);
}

function importRules(_string){
    try{
        var rulesLoaded = JSON.parse(_string);
        var newRules    = [];

        if (!rulesLoaded) return null;
        if (rulesLoaded.constructor !== Array) return null;

        each(rulesLoaded, function(){
            var rule = {
                selector: this.selector,
                enabled: this.enabled,
                
                code:{
                    js:     this.code.js,
                    css:    this.code.css,
                    html:   this.code.html,
                    files:  this.code.files
                }
            };

            if (rule.selector === undefined) return;
            if (rule.enabled === undefined) return;

            if (typeof rule.code.js !== 'string') return;
            if (typeof rule.code.css !== 'string') return;
            if (typeof rule.code.html !== 'string') return;

            if (!(rule.code.files && rule.code.files.constructor === Array)) return;
            
            newRules.push(rule);
        });

        getRules(function(_rules){
            setRules(_rules.concat(newRules), updateRulesCounter);
        });
    }
    catch(ex){
        return null;
    }
}

function updateRulesCounter(){
    getRules(function(_rules){
        el.rulesCounter.textContent = _rules.length;
    });
}

function updateSettings(){
    browser.storage.local.set({
        settings: {
            nightmode: el.cbNightmode.checked,
            showcounter: el.cbShowcounter.checked
        }
    });
}

window.addEventListener('load', function(_e){
    el = {
        rulesCounter: $('#rules-counter'),
        fileImport: $('#file-import'),
        cbNightmode: $('input[data-name="cb-night-mode]'),
        cbShowcounter: $('input[data-name="cb-show-counter]')
    };

    updateRulesCounter();

    window.addEventListener('click', function(_e){

        var target = _e.target;
        switch(target.dataset.name){

            case 'btn-clear-rules': 
                el.rulesCounter.textContent = '';
                browser.storage.local.set({ rules: [] }).then(updateRulesCounter);
                break;
            case 'btn-export': 
                getRules(function(_rules){
                    var li  = closest(target, 'li');
                    var res = copyString(JSON.stringify(_rules));

                    if (res)
                        li.dataset.result = "success";
                    else
                        li.dataset.result = "fail";
                });
                break;
            case 'btn-import': 
                el.fileImport.click();
                break;

        }
    });
    window.addEventListener('change', function(_e){

        var target = _e.target;
        switch(target.dataset.name){

            case 'inp-file-import': 
                var li   = closest(target, 'li');
                var file = target.files[0];

                if (file){
                    
                    var reader = new FileReader();

                    reader.addEventListener("loadend", function() {
                        var res = importRules(this.result);

                        if (res)
                            li.dataset.result = "success";
                        else
                            li.dataset.result = "fail";

                    });
                    reader.addEventListener("error", function() {
                        li.dataset.result = "fail";
                    });

                    reader.readAsText(file);

                }

                target.value = null;
                break;

            case 'cb-night-mode': 
                updateSettings();
                break;

            case 'cb-show-counter': 
                updateSettings();
                break;
            
        }
    });
});