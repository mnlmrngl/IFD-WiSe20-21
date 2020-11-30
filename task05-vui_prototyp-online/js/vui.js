var btn = document.querySelector('button');
btn.addEventListener('click', function () {

    var artyom = new Artyom();
    var audioStop = new Audio('./stop.wav');
    var audioActive = new Audio('./active.wav');
    var startObeyKeyword = 'Hallo Intranet';
    artyom.dontObey();
    var context ='today_task';
    var isEnding;


    artyom.fatality();

    artyom.initialize({
        executionKeyword: 'jetzt',
        speed: 0.9,
        lang: "de-DE",
        continuous: true,
        listen: true,
        interimResults: true,
        debug: true,
        obeyKeyword: startObeyKeyword,
        soundex: true,
        debug: true,
    }).then(function () {
        console.log("Ready!");
    });


    artyom.addCommands({
        indexes: ['Was steht heute an'],
        action: function () {
            context = 'today';
            artyom.say('Du hast heute eine Veranstaltung und eine Abgabe.');

        }
    });


    artyom.addCommands({
        indexes: ['Welche Abgabe', 'Welche Veranstaltung'],
        action: function (i) {
            if (context == 'today' && i == 0) {
                artyom.say('Na die in Interface Design. Du musst einen VUI Prototyp machen.')
                context = 'today_task';
            }
            if (context == 'today' && i == 1) {
                artyom.say('Marketing Automation. Das hast du in 23 Minuten')
                context = 'today_lecture';
            }
        }
    });


    //############################# TASK ##########################################   
    artyom.addCommands({
        smart: true,
        indexes: ['Schick mir bitte alle Infos dazu', 'Wann * abgeben', '* vergessen'],
        action: function (i, wildcard) {
            wildcard = null;
            if (context == 'today_task' && i == 0) {
                sendMail();
            }
            if (context == 'today_task' && i == 1) {
                context = 'today_task_when';
                artyom.say('Heute abend um 18 Uhr. Du hast also noch 9 Stunden und 38 Minuten dafür Zeit');
            }
            if (context == 'today_task' && i == 2) {
                artyom.sayRandom([
                        'Mach dir keine Sorgen.',
                        'Kein Stress',
                    ]),
                    artyom.say('Ich kann dir alle Informationen dazu per Mail schicken. Soll ich das machen?')
                context = 'today_task_forget'
            }
        }
    });

    artyom.addCommands({
        indexes: ['Schick mir bitte alle Infos dafür per Mail'],
        action: function () {
            if (context == 'today_task' || context == 'today_task_when') {
                sendMail();
            }
        }
    });

    artyom.addCommands({
        indexes: ['Danke'],
        action: function () {
            if (context == 'today_task' || context == 'today_lecture' || context == 'today_task_when') {
                youAreWelcome();
                isEnding = true;

                contextEnd()


            }
        }
    });



    //############################# LECTURE ##########################################   
    artyom.addCommands({
        indexes: ['Öffne schon mal alles auf meinem PC dafür', 'Öffne dafür alles auf meinem PC'],
        action: function (i) {
            if (context == 'today_lecture' && (i == 0 || i == 1)) {
                j = 0;
                context = 'today_lecture_open';
                youAreWelcome()
                artyom.when('SPEECH_SYNTHESIS_END', function () {
                    if (j == 0) {
                        sayBye();
                        j++;
                    }
                })
                artyom.when('SPEECH_SYNTHESIS_END', function () {
                    if (j == 1) {
                        isEnding = true;
                        contextEnd();
                        j = null;
                    }
                })
            }
        }
    });

    artyom.addCommands({
        indexes: ['Ja', 'Yes'],
        action: function () {
            if (context == 'today_task_forget' || context == 'today_task_send') {
                j = 0;
                confimSendMail();
                artyom.when('SPEECH_SYNTHESIS_END', function () {
                    if (j == 0) {
                        sayBye();
                        j++;
                    }
                })
                artyom.when('SPEECH_SYNTHESIS_END', function () {
                    console.log('j ' + j)
                    if (j == 1) {
                        isEnding = true;
                        contextEnd();
                        j = null;
                    }
                })
            }
        }
    });

    artyom.addCommands({
        indexes: ['Nein'],
        action: function () {
            if (context == 'today_task_send' || context == 'today_task_forget') {
                j = 0;
                artyom.say('Okay. Bis zum nächsten Mal');
                artyom.when('SPEECH_SYNTHESIS_END', function () {
                    console.log('j ' + j)
                    if (j == 0) {
                        isEnding = true;
                        contextEnd();
                        j = null;
                    }
                })
            }

        }
    })


    /*
    ###########
    ###########
    ###########
    ###########
     */

    //Play Sound after say obey keyword
    artyom.addCommands({
        indexes: [startObeyKeyword],
        action: function () {
            isEnding = false;
            audioActive.play();
            artyom.say(' ');
        }
    });


    //No command found
    artyom.when('NOT_COMMAND_MATCHED', function () {
        artyom.say('Sorry. Dabei kann ich dir leider nicht helfen');
    });

    //send Mail
    function sendMail() {
        j = 0;
        context = 'today_task_send';
        confimSendMail()
        artyom.when('SPEECH_SYNTHESIS_END', function () {
            if (j == 0) {
                sayBye();
                j++;
            }
        })
        artyom.when('SPEECH_SYNTHESIS_END', function () {
            console.log('j ' + j)
            if (j == 1) {
                isEnding = true;
                contextEnd(true);
                j = null;
            }
        })
    }

    //Confimation to send an email
    function confimSendMail() {
        artyom.say('Alles klar. Ich schicke dir alle Infos an deine HFU Mail. In spätestens einer Minute solltest du die Mail in deinem Posteingang haben.');
    }

    //Awnser to Thanks
    function youAreWelcome() {
        artyom.sayRandom([
            'Kein Ding',
            'Kein Problem',
            'Immer wieder gern'
        ])
    }

    //Anything else?
    function anythingElse() {
        artyom.sayRandom([
            'Kann ich dir sonst noch helfen?',
            'Kann ich dir noch bei etwas anderem helfen?'
        ])
    }

    //Say Bye
    function sayBye() {
        artyom.sayRandom([
            'Tschüss',
            'Ciao',
            'Bis dann',
            'Bis zum nächsten Mal',
        ]);
    }

    //Context End
    function contextEnd() {
        artyom.when('SPEECH_SYNTHESIS_END', function () {
            if (isEnding == true) {
                setTimeout(function () {
                    artyom.shutUp();
                    audioStop.play();
                    artyom.dontObey();
                    context = null;
                    j = null;
                }, 700);
            }
        })
    }

    //Stop Talking
    artyom.addCommands({
        indexes: ['stop', 'halt', 'aus', 'tschüss'],
        action: function () {
            artyom.shutUp();
            audioStop.play();
            artyom.dontObey();
            context = null;
            j = null;
        }
    });
})