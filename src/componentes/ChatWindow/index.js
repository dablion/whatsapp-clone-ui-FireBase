import React, {useState, useEffect, useRef} from 'react';
import './styles.css';
import SearchIcon from '@material-ui/icons/Search';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import MicIcon from '@material-ui/icons/Mic';
import EmojiPicker, {  SKIN_TONE_NEUTRAL } from 'emoji-picker-react'; 
import MessageItem from '../MessageItem';
import Api from '../../Api';

export default ({user, data}) =>{

    const body = useRef();

    let recognition = null;
    let SpeechRecgonition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(SpeechRecgonition !== undefined){
        recognition = new SpeechRecgonition();
    }

    const [emojiOpen, setEmojiOpen] = useState(false);
    const [text, setText] = useState('');
    const [listening, setListening] = useState(false);
    const [list, setlist] = useState([]);
    const [users, setUsers] = useState([]);
    
    useEffect(()=>{
        setlist([]);
        let unsub = Api.onChatContent(data.chatId, setlist, setUsers);
        return unsub;
    }, [data.chatId]);

    useEffect(()=>{
        if(body.current.scrollHeight > body.current.offsetHeight){
            body.current.scrollTop = body.current.scrollHeight - body.current.offsetHeight;
        }
    }, [list]);

    const handleEmojiClick = (e, emojiObject) =>{
        console.log(emojiObject);
        setText(text + emojiObject.emoji);
    }

    const handleOpenEmoji = () =>{
        setEmojiOpen(true);
    }

    const handleCloseEmoji= () =>{
        setEmojiOpen(false);
    }

    const handleMicClick = () =>{
        console.log(recognition);
        if(recognition !== null){
            recognition.onstart = ()=>{
                setListening(true);
            }
            recognition.onend = ()=>{
                setListening(false);
            }
            recognition.onresult = (e)=>{
                setText(e.results[0][0].transcript)
            }
            recognition.start();
        }
    }
    const handleSendClick = () =>{
        if(text !== ''){
            Api.sendMessage(data, user.id, 'text', text, users);
            setText('');
            setEmojiOpen(false);
        }
    }

    const handleInputKeyUp = (e) =>{
        if(e.keyCode === 13){
            handleSendClick();
        }
    }


    return (
        <div className="chatWindow">
            <div className="chatWindow--header">
                <div className="chatWindow--info">
                    <img className="chatWindow--avatar" src={data.image} alt="avatar"/>  
                    <div className="chatWindow--name">
                        {data.title}
                    </div>              
                </div>
                <div className="chatWindow--headerbuttons">
                    <div className="chatWindow--btn">
                        <SearchIcon style={{color: '#919191'}} />
                    </div>
                    <div className="chatWindow--btn">
                        <AttachFileIcon style={{color: '#919191'}} />
                    </div>
                    <div className="chatWindow--btn">
                        <MoreVertIcon style={{color: '#919191'}} />
                    </div>
                </div>
            </div>
            <div ref={body} className="chatWindow--body">
                {list.map((item, key)=>(
                    <MessageItem 
                        key={key}
                        data={item}
                        user={user}
                    />
                ))}
            </div>
            <div className="chatWindow--emojiarea"
                style={{height: emojiOpen ? '200px' : '0px'}}>
                <EmojiPicker 
                    onEmojiClick={handleEmojiClick}
                    disableSearchBar
                    disableSkinTonePicker
                    skinTone={SKIN_TONE_NEUTRAL}
                />
            </div>
            <div className="chatWindow--footer">
                <div className="chatWindow-pre" >
                    <div className="chatWindow--btn"
                        onClick={handleCloseEmoji}
                        style={{width: emojiOpen ? 40 : 0}}>
                        <CloseIcon style={{color: '#919191'}} />
                    </div>
                    <div className="chatWindow--btn"
                        onClick={handleOpenEmoji}>
                        <InsertEmoticonIcon style={{color: emojiOpen ? '#009688':'#919191'}} />
                    </div>
                </div>
                <div className="chatWindow-inputarea" >
                    <input 
                        className="chatWindow--input" 
                        type="text"  
                        placeholder="Digite uma mensagem"
                        value={text}
                        onChange={e=>setText(e.target.value)}
                        onKeyUp={handleInputKeyUp}
                    />
                </div>
                <div className="chatWindow-pos" >
                    {text === '' &&
                        <div onClick={handleMicClick} className="chatWindow--btn">
                            <MicIcon style={{color: listening? '#126ECE': '#919191'}} />
                        </div>
                    }
                    {text !== '' &&
                        <div onClick={handleSendClick} className="chatWindow--btn">
                            <SendIcon style={{color: '#919191'}} />
                        </div>
                    }   
                </div>
            </div>
        </div>
    )
}