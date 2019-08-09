import React from "react";
import { useState, useEffect } from "react";
import VoiceChat from "./voice-chat";
import { guid } from "react-chat/utils/func";
import debounce from 'lodash/debounce';
declare var MediaRecorder;
MediaRecorder = require("audio-recorder-polyfill");
import puppy from 'react-chat/puppy.png'
const user = puppy//"https://forum.rasa.com/user_avatar/forum.rasa.com/juste/45/15_2.png";
const bot =
    "https://image.shutterstock.com/image-vector/robot-icon-bot-sign-design-260nw-715962319.jpg";

const messageDelay = 800;

function startRecord() {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const recorder = new MediaRecorder(stream);

        const audio = new Promise((resovle, reject) => {
            recorder.addEventListener("dataavailable", e => {
                let form = new FormData();
                form.append("file", e.data);

                const url = URL.createObjectURL(e.data);

                const text = fetch("https://miroservice.azurewebsites.net/api/speech", {
                    method: "POST",
                    body: form,
                }).then(response => {
                    return response.ok
                        ? response
                            .json()
                            .then(resp =>
                                resp.identifiable === "success" && resp.text !== 'NoMatch'
                                    ? `I heard you say ${resp.text}`
                                    : [
                                        "Sorry, I didn’t understand that.",
                                        "May I beg your pardon?",
                                        "Pardon me."
                                    ][Math.floor(Math.random() * 3)]
                            )
                        : Promise.resolve("Did not hear clearly");
                });

                resovle({ url, text });
            });
        });

        recorder.start();

        return { recorder, audio };
    });
}

function stopRecord(recorder) {
    recorder.stop();
    recorder.stream.getTracks().forEach(track => track.stop());
}
let shiftQueuedMessages
let currentRecorder
export default function ConnectedChat({ welcome, title }) {
    const [messages, setMessages] = useState([]);
    const [messageQueue, setMessageQueue] = useState([]);
    const [enQueued, setEnQueuedEvent] = useState(Date.now());

    const responseComing = (messageQueue) => {
        setMessageQueue(messageQueue);
        setEnQueuedEvent(Date.now());
    }

    const startWaiting = waitingResponse(responseComing);

    const stopWaiting = comingResponse(responseComing);

    useEffect(() => {

        shiftQueuedMessages = debounce((messageQueue, messages) => {
            if (messageQueue.length > 0) {
                const message = messageQueue.shift();
                const temp = messages.find(m => m.id === message.id);
                if (temp) {
                    temp.message = message.message
                    setMessages([...messages]);
                } else {
                    setMessages([...messages, message]);
                }

                responseComing(messageQueue)
            }
        }, messageDelay)

        if (welcome) {
            const message = {
                message: { type: "text", text: welcome },
                time: Date.now(),
                user: {
                    avatar: bot,
                    name: "Cute Justina Bot :)"
                },
                id: guid()
            };
            setMessages([message]);
        }
    }, []);

    useEffect(() => shiftQueuedMessages(messageQueue, messages), [enQueued]);

    return (
        <VoiceChat
            title={title}
            messages={messages.sort((pre, cur) => pre.time - cur.time)}
            onStartRecord={() => {

                const userWaitingId = startWaiting(
                    messageQueue,
                    {
                        avatar: user,
                        name: "Puppy"
                    }
                )

                startRecord().then(({ recorder, audio }) => {
                    currentRecorder = recorder;
                    audio.then(({ url, text }) => {

                        stopWaiting(
                            messageQueue,
                            {
                                type: "audio",
                                url
                            },
                            userWaitingId
                        )

                        const botWaitingId = startWaiting(
                            messageQueue,
                            {
                                avatar: bot,
                                name: "Cute Justina Bot :)"
                            }
                        )

                        text.then(text => stopWaiting(
                            messageQueue,
                            {
                                type: "text",
                                text
                            },
                            botWaitingId
                        ));
                    });
                });
            }}
            onStopRecord={() => {
                currentRecorder && stopRecord(currentRecorder);
            }}
            onTextTyping={(text) => {
                responseComing(appendMessage(
                    messageQueue,
                    {
                        type: "text",
                        text
                    },
                    {
                        avatar: user,
                        name: "Puppy"
                    }
                ))

                responseComing(appendMessage(
                    messageQueue,
                    {
                        type: "text",
                        text: `I heard you say ${text}`
                    },
                    {
                        avatar: bot,
                        name: "Cute Justina Bot :)"
                    }
                ))
            }}
        ></VoiceChat>
    );
}
function appendMessage(messageQueue: any[], message, user, id?) {
    messageQueue.push({
        message: message,
        time: Date.now(),
        user: user,
        id: id || guid()
    });

    return messageQueue;
}
function waitingResponse(enQueue) {
    return (messageQueue, user) => {
        const queue = appendMessage(
            messageQueue,
            {
                type: "waiting",
            },
            user
        )

        const waitingId = queue[queue.length - 1].id;

        enQueue(queue);

        return waitingId
    }
}

function comingResponse(enQueue) {
    return (messageQueue, message, waitingId) => enQueue(appendMessage(
        messageQueue,
        message,
        null,
        waitingId
    ))
}