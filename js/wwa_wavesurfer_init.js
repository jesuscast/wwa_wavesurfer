function getCoordsTop(elem) {
    var box = elem.getBoundingClientRect();

    return box.top + pageYOffset;
}

function getCoordsLeft(elem) {
    var box = elem.getBoundingClientRect();

    return box.left + pageXOffset;
}

function block(e) {
    e.preventDefault();
}


function dataURItoBlob(dataURI, options) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], options);
}

//return a promise that resolves with a File instance
function urltoFile(url, filename, mimeType){
    mimeType = mimeType || (url.match(/^data:([^;]+);/)||'')[1];
    return (fetch(url)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename, {type:mimeType});})
    );
}

document.addEventListener('contextmenu', block, false);

function popup() {
    var oldDiv = document.createElement("div");
    oldDiv.setAttribute("id", "audioTop");
    oldDiv.style.display = 'none';
    var p = document.createElement('p');
    p.setAttribute('id', 'myAudioPopup');
    p.innerHTML = 'For using all features <a href="https://www.viewmyvoice.net/login-2/">Log In</a> or <a href="https://www.viewmyvoice.net/register-2/">Sign In</a>';
    oldDiv.appendChild(p);
    var nextStep = document.createElement('p');
    nextStep.setAttribute('id', 'myAudioClosePopup');
    nextStep.innerHTML = 'Click here to continue or Sign In';
    oldDiv.appendChild(nextStep);
    document.body.appendChild(oldDiv);
}

// popup();

jQuery("#myAudioClosePopup").click(function() {
    jQuery('#audioTop').slideUp();
});

// setup videojs-record
var player = videojs('myAudio', {
    controls: true,
    width: 600,
    height: 300,
    debug: false,
    plugins: {
        wavesurfer: {
            src: "live",
            waveColor: "#00e243",
            progressColor: "#2E732D",
            debug: false,
            cursorWidth: 2,
            msDisplayMax: 40,
            hideScrollbar: true,
        },
        record: {
            audio: true,
            maxLength: 10,
            debug: false,
            audioEngine: "recorder.js",
        }
    }
});

// player error handling

player.on('deviceError', function () {
    console.warn('device error:', player.deviceErrorCode);
});
player.on('error', function (error) {
    console.log('error:', error);
});


function uploadFile(audioFile, cb) {

    // Initialize the jQuery File Upload widget
    jQuery('#wavUpload').fileupload({
        url: wwav_variables.ajax_url,
        formData: {
            'action': 'wwaw_upload_wav',
            'nonce': wwav_variables.wwaw_nonce,
        },
        add: function(e, data) {
            // jQuery('#wavUpload').click(function() {
            //     jQuery('#wwa_message').text('Processing');

            //     data.submit();
            //     jQuery(this).hide();
            // });
            jQuery('#wwa_message').text('Processing');

            data.submit();
            jQuery(this).hide();
        },
        done: function(e, data) {
            jQuery.each(data.files, function(index, file) {
                var message = 'Record Upload Complete!';
                if (cb) {
                    cb();
                }
            });
        }
    });
    // upload data to server
    var filesList = [audioFile];
    jQuery('#wavUpload').fileupload('add', {
        files: filesList
    });
}

function receiveBase(cb) {
    var a = jQuery('.vjs-waveform').find('wave');
    a[1].style.borderRight = 'none';

    /*html2canvas(a[0], {
        height: 270,
        width: 600,
        timeout: 0,
        logging: false}).then(function(canvas) {

            //var toImg = canvas.toDataURL('image/png');
                           
            var toImg = canvas.toDataURL("image/png");
            var span = document.createElement('span');
            span.setAttribute('id', 'renderedImg');

            span.dataset.base = toImg;
            audio_img += toImg;
            document.body.appendChild(span);                

            console.log('imagedata => ' + toImg);
    });
    */
    html2canvas(a[0], {
        height: 270,
        width: 600,
        timeout: 0,
        logging: false,
        onrendered: function(canvas) {
            var toImg = canvas.toDataURL('image/png');

            // console.log('imagedata => ' + toImg);

            var span = document.createElement('span');
            span.setAttribute('id', 'renderedImg');
            span.dataset.base = toImg;
            document.body.appendChild(span);
            if (cb) {
                cb(toImg);
            }
        },
    });

}


function listenForUpload(imgBase, audioFile, cb) {
    jQuery('#imageUpload').on('click', function() {
        jQuery(this).hide();
        jQuery('#wwa_message').text('Processing');

        function imgToDom() {
            // var imgBase = document.getElementById('renderedImg').dataset.base;
            //var imgBase = audio_img;
            var name = audioFile.name;
            name = name.substr(0, name.length - 3);
            name += 'png';
            jQuery("#go3 .fft").html("Loading...")
            //Usage example:
            urltoFile(imgBase, name)
            .then(function(file){
                console.log(file);
                var form = new FormData();
                form.append("filename", name);
                form.append("file", file);

                jQuery.ajax({
                    "async": true,
                    "crossDomain": true,
                    "url": "https://image.kite.ly/upload/",
                    "method": "POST",
                    "processData": false,
                    "contentType": false,
                    "mimeType": "multipart/form-data",
                    "data": form,
                    "dataType": "json",
                }).done(function(response) {
                    // var message = 'Image Upload Complete!';
                    var $link = jQuery("a #go3").parent();
                    var url = new URL(jQuery("a #go3").parent().attr('href'));
                    url.search = new URLSearchParams({"img": response.full});
                    url.pathname = "/create-products/";
                    // we need to remove the www so it matches the response
                    // so the localstorage works..
                    url.href = url.href.replace(/www\.view/g,'view');
                    localStorage.setItem('img', response.full);
                    $link.attr('href', url.href);
                    jQuery("#go3 .fft").html("Create products")
                    jQuery.ajax({
                        type: 'POST',
                        url: wwav_variables.ajax_url,
                        data: {
                            'action': 'vmv_upload_transactions',
                            'nonce': wwav_variables.wwaw_nonce,
                            'image_url': response.full,
                            'image_url_preview': response.preview
                        },
                        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                        success: function(response) {
                            console.log(response);
                        }
                    });
                });
            })
        }

        imgToDom();
    });
};

// data is available
player.on('finishRecord', function() {

    // the blob object contains the audio data
    var audioFile = player.recordedData;

    function activatePopup() {
        var width = window.innerWidth / 4;
        var findTop = getCoordsTop(myAudio);
        var findLeft = getCoordsLeft(myAudio);
        var oldDiv = document.getElementById('audioTop');
        oldDiv.style.width = myAudio.clientWidth + "px";
        oldDiv.style.height = myAudio.clientHeight + "px";
        oldDiv.style.top = findTop + 'px';
        oldDiv.style.left = findLeft + 'px';
        oldDiv.style.display = '';
    }

    var test = +wwav_variables.popup;
    // if (!test) {
    //     activatePopup();
    // }

    uploadFile(audioFile, function() {
        console.log("Upload complete!");
        receiveBase(function(toImg) {
            jQuery('#fileupload').show();
            jQuery('#wavUpload').show();
            jQuery('#imageUpload').show();
            listenForUpload(toImg, audioFile, function() {
            });
        });
    });
});