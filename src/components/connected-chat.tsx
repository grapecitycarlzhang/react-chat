import React from "react";
import { useState, useEffect } from "react";
import VoiceChat from "./voice-chat";
import { guid } from "react-chat/utils/func";
import debounce from 'lodash/debounce';
declare var MediaRecorder;
MediaRecorder = require("audio-recorder-polyfill");
// import puppy from 'react-chat/puppy.png'
import puppy from 'react-chat/puppy-4-06.jpg'
const user = puppy
const bot = "https://image.shutterstock.com/image-vector/robot-icon-bot-sign-design-260nw-715962319.jpg";

const messageDelay = 200;
type ChatMessage = { chatBotApi: string, conversationId: string, message?: string, voice?: any }
type ChatResponse = { messages: any[] }

function sendMessage({ chatBotApi, conversationId, message, voice }: ChatMessage) {
    if (message === "" && voice === null) return;

    let form = new FormData();
    form.append("message", message || '');
    form.append("voice", voice || null);
    form.append("conversationId", conversationId);

    return fetch(
        chatBotApi,
        {
            method: "POST",
            body: form,
        }
    ).then(response => {
        if (response.ok) {
            return response.json()
        }
    })
}
function chatWithBot(message: ChatMessage) {
    return sendMessage(message).then(parseMessages)
}
function getBotMesage(message) {
    return {
        message: message,
        time: Date.now(),
        user: {
            avatar: bot,
            name: "Cute Justina Bot :)"
        },
        id: guid()
    }
}
function parseMessages({ messages }: ChatResponse) {
    // const responseMessages = []
    // messages.forEach(message => {
    //     if (message.text) {
    //         message.type = 'text'
    //         responseMessages.push(getBotMesage({ ...message }))
    //     }
    //     if (message.buttons) {
    //         message.type = 'buttons'
    //         responseMessages.push(getBotMesage({ ...message }))
    //     }
    // })
    // return responseMessages
    return messages.map((message) => {
        if (message.text) {
            message.type = 'text'
        }
        return getBotMesage(message)
    });
}
function chatToBot(chatBotApi, conversationId) {
    return (message: string) => {
        return chatWithBot({ chatBotApi, conversationId, message })
    }
}

function startRecord(chatBotApi, conversationId) {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const recorder = new MediaRecorder(stream);

        const audio = new Promise((resovle, reject) => {
            recorder.addEventListener("dataavailable", e => {

                const url = URL.createObjectURL(e.data);

                const text = chatWithBot({
                    chatBotApi,
                    conversationId,
                    voice: e.data
                })

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
export default function ConnectedChat({ welcome, startMessage, title, conversationId, chatApi, defaultVoiceInput = true }) {
    const [messages, setMessages] = useState([]);
    const [messageQueue, setMessageQueue] = useState([]);
    const [enQueued, setEnQueuedEvent] = useState(Date.now());

    const responseComing = (messageQueue) => {
        setMessageQueue(messageQueue);
        setEnQueuedEvent(Date.now());
    }

    const getBotResponse = chatToBot(chatApi, conversationId)

    const startWaiting = waitingResponse(responseComing);

    const stopWaiting = comingResponse(responseComing);

    const stopWaitings = comingResponses(responseComing);


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
        if (startMessage) {
            getBotResponse(startMessage)
                .then(messagesComing(messageQueue, responseComing))
        }
    }, []);

    useEffect(() => shiftQueuedMessages(messageQueue, messages), [enQueued]);

    return (
        <VoiceChat
            title={title}
            messages={messages.sort((pre, cur) => pre.time - cur.time)}
            defaultVoiceInput={defaultVoiceInput}
            onStartRecord={() => {

                const userWaitingId = startWaiting(
                    messageQueue,
                    {
                        avatar: user,
                        name: "Puppy"
                    }
                )

                startRecord(chatApi, conversationId).then(({ recorder, audio }) => {
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

                        text.then(messages => stopWaitings(
                            messageQueue,
                            messages,
                            botWaitingId
                        ));
                    });
                });
            }}
            onStopRecord={() => {
                currentRecorder && stopRecord(currentRecorder);
            }}
            onTextTyping={(text) => {
                !text.startsWith('/gs') && responseComing(appendMessage(
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

                getBotResponse(text)
                    .then(messagesComing(messageQueue, responseComing))

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

function comingResponses(enQueue) {
    return (messageQueue, messages, waitingId) => {
        messages.length > 0 && (messages[0].id = waitingId);
        messagesComing(messageQueue, enQueue)(messages)
    }
}

function messagesComing(messageQueue, responseComing) {
    return (messages) => {
        messageQueue.push(...messages)
        responseComing(messageQueue)
    }
}