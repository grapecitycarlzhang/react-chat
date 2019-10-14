import React, { useEffect } from "react";
import { useState } from "react";
import {
    createStyles,
    Theme,
    makeStyles,
    createMuiTheme,
    styled,
    withStyles
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Fab from "@material-ui/core/Fab";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import Keyboard from "@material-ui/icons/Keyboard";
import KeyboardVoice from "@material-ui/icons/KeyboardVoice";
import Mic from "@material-ui/icons/Mic";
import MicOff from "@material-ui/icons/MicOff";
import Typography from "@material-ui/core/Typography";
import ArrowBack from "@material-ui/icons/ArrowBack";
import MoreHoriz from "@material-ui/icons/MoreHoriz";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import VolumeUp from "@material-ui/icons/VolumeUp";
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Send from "@material-ui/icons/Send";

const useChatHeaderStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            flexGrow: 1
        },
        text: {
            padding: theme.spacing(2, 2, 0)
        }
    })
);
function ChatHeader({ title }) {
    const classes = useChatHeaderStyles({});
    return (
        <AppBar position="fixed" color="primary">
            <Toolbar>
                {/* <IconButton edge="start" color="inherit">
                    <ArrowBack />
                </IconButton> */}
                <Typography variant="h6" className={classes.title}>
                    {title}
                </Typography>
                {/* <IconButton edge="end" color="inherit">
                    <MoreHoriz />
                </IconButton> */}
            </Toolbar>
        </AppBar>
    );
}

const useChatFooterStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            top: "auto",
            bottom: 0
        },
        grow: {
            flexGrow: 1
        },
        fabButton: {
            position: "absolute",
            zIndex: 1,
            top: -30,
            left: 0,
            right: 0,
            margin: "0 auto"
        },
        input: {
            color: "inherit",
            underline: "",
            flexGrow: 1,
            margin: theme.spacing(1)
        }
    })
);

const theme = createMuiTheme({
    palette: {
        type: "dark"
    }
});

function ChatFooter({ onStartRecord, onStopRecord, onTextTyping, defaultVoiceInput }) {
    const classes = useChatFooterStyles({});
    const [isVoiceInput, setVoiceInput] = useState(defaultVoiceInput);
    const [isRecord, setRecord] = useState(false);
    return (
        <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar>
                {isVoiceInput ? (
                    <Fab
                        color="secondary"
                        aria-label="add"
                        className={classes.fabButton}
                        onClick={() => {
                            isRecord ? onStopRecord() : onStartRecord();
                            setRecord(!isRecord);
                        }}
                    >
                        {isRecord ? <MicOff /> : <Mic />}
                    </Fab>
                ) : null}
                {isVoiceInput ? (
                    <div className={classes.grow} />
                ) : (
                        <ThemeProvider theme={theme}>
                            <Input
                                id="text-typing-input"
                                autoFocus
                                className={classes.input}
                                inputProps={{
                                    "aria-label": "description"
                                }}
                                onKeyUp={(event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                    const value = event.target['value'];
                                    if (event.key === 'Enter' && value && value.trim()) {
                                        onTextTyping(value)
                                        event.target['value'] = ''
                                    }
                                }}
                            />
                        </ThemeProvider>
                    )}
                {!isVoiceInput && <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => {
                        const dom = document.getElementById('text-typing-input') as HTMLInputElement
                        if (dom.value && dom.value.trim()) {
                            onTextTyping(dom.value)
                            dom.value = ''
                        }
                    }}
                >
                    <Send />
                </IconButton>}
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => setVoiceInput(!isVoiceInput)}
                >
                    {isVoiceInput ? <Keyboard /> : <KeyboardVoice />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
const useChatListStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: '100%',
            overflowY: 'auto',
        },
        list: {
            marginBottom: theme.spacing(2)
        },
        subheader: {
            backgroundColor: theme.palette.background.paper
        }
    })
);
const useBotItemStyles = makeStyles({
    listItemWaiting: {
        textAlign: "right"
    },
    listItemAvatar: {
        display: "flex",
        justifyContent: "flex-end"
    },
    image: {
        height: 160
    },
    video: {
        height: 160
    },
    buttons: {
        height: 100,
        cursor: "pointer"
    }
});

const ChatCard = withStyles({
    left: {
        float: 'left',
        maxWidth: 275,
    },
    right: {
        float: 'right',
        maxWidth: 275,
    }
})(({ float, classes, children }: any) => <Card className={float === 'right' ? classes.right : classes.left}><CardContent>{children}</CardContent></Card>)

function BotItem({ message: { type, text, medias, pages }, avatar, onTextTyping }) {
    const classes = useBotItemStyles({});
    return (
        <ListItem>
            {type === "text" && <ListItemText primary={<ChatCard float='right'>{text}</ChatCard>} />}
            {type === "buttons" && <ListItemText primary={<ChatCard float='right'><div>
                {pages.map(btn => <img key={btn.url} className={classes.buttons} src={btn.url} onClick={() => btn.payload !== '/back' && onTextTyping(btn.payload)}></img>)}
            </div></ChatCard>} />}
            {type === "image" && <ListItemText primary={<ChatCard float='right'><img src={pages[0].url} className={classes.image}></img></ChatCard>} />}
            {type === "video" && <ListItemText primary={<ChatCard float='right'><video src={medias[0].url} className={classes.video} onEnded={() => medias[0].payload && onTextTyping(medias[0].payload)} webkit-playsinline='true' playsInline autoPlay controls ></video></ChatCard>} />}
            {type === "waiting" && <ListItemText className={classes.listItemWaiting} primary={<CircularProgress size={20} />} />}
            <ListItemAvatar className={classes.listItemAvatar}>
                <Avatar alt="Profile Picture" src={avatar} />
            </ListItemAvatar>
        </ListItem>
    );
}
function PersonItem({ message: { type, text, url }, avatar }) {
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt="Profile Picture" src={avatar} />
            </ListItemAvatar>
            {type === "audio" && (
                <ListItemIcon>
                    <IconButton onClick={() => playAudio(url)}>
                        <VolumeUp />
                    </IconButton>
                </ListItemIcon>
            )}
            {type === "waiting" && <ListItemText primary={<CircularProgress size={20} />} />}
            {type === "text" && <ListItemText primary={<ChatCard>{text}</ChatCard>} />}
        </ListItem>
    );
}
function getListItem(message, { avatar, name }, onTextTyping) {
    return name === "Cute Justina Bot :)" ? (
        <BotItem message={message} avatar={avatar} onTextTyping={onTextTyping} />
    ) : (
            <PersonItem message={message} avatar={avatar} />
        );
}

function ChatList({ messages, onTextTyping }) {
    const classes = useChatListStyles({});

    useEffect(() => {
        const dom = document.querySelector('.message-container')
        dom.scrollTop = dom.scrollHeight
    }, [messages])

    return (
        <div className={`message-container ${classes.root}`}>
            <List className={classes.list}>
                {messages.map(({ id, message, user }) => (
                    <React.Fragment key={id}>
                        {/* {id === 1 && <ListSubheader className={classes.subheader}>Today</ListSubheader>} */}
                        {/* {id === 3 && <ListSubheader className={classes.subheader}>Yesterday</ListSubheader>} */}
                        {getListItem(message, user, onTextTyping)}
                    </React.Fragment>
                ))}
            </List>
            <audio id="char-audio"></audio>
        </div>
    );
}
function playAudio(src) {
    var audio = document.getElementById("char-audio") as HTMLAudioElement;
    audio.src = src;
    audio.play();
}
const ChatContainer = styled('div')({
    height: '100vh',
    paddingTop: 60,
    paddingBottom: 60,
});

export default function VoiceChat({
    title,
    messages,
    onStartRecord,
    onStopRecord,
    onTextTyping,
    defaultVoiceInput = true,
}) {
    return (
        <ChatContainer>
            <CssBaseline />
            <ChatHeader title={title} />
            <ChatList messages={messages} onTextTyping={onTextTyping} />
            <ChatFooter onStartRecord={onStartRecord} onStopRecord={onStopRecord} onTextTyping={onTextTyping} defaultVoiceInput={defaultVoiceInput} />
        </ChatContainer>
    );
}
