var alert = document.querySelector('#idAlert');
if (alert) {
    alert.classList.add("show");
    setTimeout(() => {
        var button = document.querySelector('#idButton');
        if(button) button.click();
    }, 6000)
}