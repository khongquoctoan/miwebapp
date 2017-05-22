function showMessageBottomRight(msg, type) {
    toastr.options = {
        closeButton: true,
        //debug: true,
        progressBar: true,
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        //|| 'toast-top-right'/'toast-bottom-right'/'toast-bottom-left'/'toast-top-left'/'toast-top-full-width'/'toast-bottom-full-width'/'toast-top-center'/'toast-bottom-center',
        //onclick: null
    };
    //type = 'warning'/ 'success'/ 'info'/ 'error'
    var shortCutFunction = type || 'info';
    var msgAlert = msg;
    var title = ''
    //toastr.warning('My name is Inigo Montoya. You killed my father, prepare to die!')
    toastr[type](msg, title);
}

function showMessageComfirm(msg, callbackOK, callbackCancel) {
    alertify.theme('bootstrap');
    alertify.confirm(msg, callbackOK, callbackCancel);
}
function showMessageAlert(msg) {
    alertify.theme('bootstrap');
    alertify.alert(msg);
}

