(function () {
    'use strict';
    let pending = false;
    window.askWorkspaceConfirmation = function (message) {
        if (pending) return Promise.resolve(false);
        pending = true;
        const focus = document.activeElement;
        return new Promise(resolve => {
            const dialog = document.createElement('dialog'); dialog.className='workspace-confirm';
            const heading=document.createElement('h2'); heading.textContent='İşlemi onaylayın'; heading.id='workspaceConfirmTitle';
            const body=document.createElement('p'); body.textContent=message; body.id='workspaceConfirmText';
            const actions=document.createElement('div');
            const cancel=document.createElement('button'), ok=document.createElement('button'); cancel.type=ok.type='button'; cancel.textContent='Vazgeç';ok.textContent='Onayla';
            actions.append(cancel,ok); dialog.append(heading,body,actions); dialog.setAttribute('aria-labelledby',heading.id);dialog.setAttribute('aria-describedby',body.id);document.body.append(dialog);
            function finish(value){dialog.close();dialog.remove();pending=false;if(focus?.isConnected)focus.focus({preventScroll:true});resolve(value);}
            cancel.onclick=()=>finish(false);ok.onclick=()=>finish(true);dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false);});dialog.showModal();cancel.focus();
        });
    };
})();
