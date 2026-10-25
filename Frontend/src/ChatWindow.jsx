import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import Navbar from "./Navbar.jsx";
import PersonalitySelector from "./PersonalitySelector.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import {ScaleLoader} from "react-spinners";
function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, user} = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [navbarVisible, setNavbarVisible] = useState(true);
    const chatContentRef = useRef(null);
    const lastScrollTop = useRef(0);
    const [isListening, setIsListening] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const recognitionRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedPersonality, setSelectedPersonality] = useState('professional');
    const [wordLimit, setWordLimit] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getReply = async (quickActionPrompt) => {
        const currentPrompt = typeof quickActionPrompt === 'string' ? quickActionPrompt : prompt || '';
        const trimmedPrompt = currentPrompt.trim();
        if (!trimmedPrompt && !selectedImage) {
            return;
        }
        setLoading(true);
        setNewChat(false);

        let imageBase64 = null;
        let messageToSend = trimmedPrompt ? currentPrompt : 'Analyze this image';
        const imageForChat = selectedImage ? imagePreview : null;

        if (selectedImage) {
            const reader = new FileReader();
            imageBase64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(selectedImage);
            });
        }

        setPrevChats((chats) => [
            ...chats,
            { role: 'user', content: messageToSend, ...(imageForChat ? { image: imageForChat } : {}) }
        ]);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: messageToSend,
                threadId: currThreadId,
                userId: user?.email || user?.guestId || 'anonymous',
                userEmail: user?.email || 'anonymous@cognisphere.ai',
                image: imageBase64,
                personality: selectedPersonality,
                wordLimit: wordLimit
            })
        };

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        try {
            const response = await fetch(`${API_URL}/api/chat`, options);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend error:', errorData);
                setReply(`Error: ${errorData.error || 'Failed to get response'}`);
                setLoading(false);
                return;
            }

            const res = await response.json();

            if (res.reply) {
                setReply(res.reply);
                setPrevChats((chats) => [
                    ...chats,
                    { role: 'assistant', content: res.reply }
                ]);
                setPrompt('');
                removeImage();
            } else {
                console.error('No reply in response');
                setReply('Error: No response from AI');
                setPrevChats((chats) => [
                    ...chats,
                    { role: 'assistant', content: 'Error: No response from AI' }
                ]);
            }
        } catch(err) {
            console.error('Network error:', err);
            const errorMessage = `Network error: ${err.message}. Please check if backend is running.`;
            setReply(errorMessage);
            setPrevChats((chats) => [
                ...chats,
                { role: 'assistant', content: errorMessage }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Initialize speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSpeechSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setPrompt(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const handleChatScroll = (event) => {
        const currentScroll = event.currentTarget.scrollTop;
        const scrollDelta = currentScroll - lastScrollTop.current;

        if (currentScroll <= 10 || scrollDelta < -2) {
            setNavbarVisible(true);
        } else if (scrollDelta > 2) {
            setNavbarVisible(false);
        }

        lastScrollTop.current = currentScroll;
    };

    return (
        <div className='chatWindow'>
            <Navbar isVisible={navbarVisible} />

            <div className='chatContent' ref={chatContentRef} onScroll={handleChatScroll}>
                <Chat />
                {loading && (
                    <div className='loaderContainer'>
                        <ScaleLoader color='#fff' loading={loading} />
                    </div>
                )}
            </div>

            <div className='chatInput'>
                <div className='composer-row'>
                    <div className='controls-row'>
                        <PersonalitySelector selectedPersonality={selectedPersonality} onPersonalityChange={setSelectedPersonality} />
                        <div className='word-limit-btns'>
                            <button onClick={() => setWordLimit(null)} className={wordLimit === null ? 'active' : ''}>No Limit</button>
                            <button onClick={() => setWordLimit(50)} className={wordLimit === 50 ? 'active' : ''}>50 Words</button>
                            <button onClick={() => setWordLimit(100)} className={wordLimit === 100 ? 'active' : ''}>100 Words</button>
                            <button onClick={() => setWordLimit(200)} className={wordLimit === 200 ? 'active' : ''}>200 Words</button>
                        </div>
                    </div>
                    {selectedImage && (
                        <div className='image-preview-container'>
                            <div className='image-preview'>
                                <img src={URL.createObjectURL(selectedImage)} alt='Selected' />
                                <button className='remove-image-btn' onClick={removeImage}>
                                    <i className='fa-solid fa-xmark'></i>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className='inputBox'>
                        <input
                            type='file'
                            ref={fileInputRef}
                            accept='image/*'
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />
                        <div
                            className='image-upload-btn'
                            onClick={() => fileInputRef.current?.click()}
                            title='Upload image'
                        >
                            <i className='fa-solid fa-image'></i>
                        </div>
                        <input placeholder='Ask anything'
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                        >
                        </input>
                        {isSpeechSupported && (
                            <div
                                id='voiceInput'
                                className={`voice-btn ${isListening ? 'listening' : ''}`}
                                onClick={toggleVoiceInput}
                                title={isListening ? 'Stop recording' : 'Start voice input'}
                            >
                                <i className={`fa-solid ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                            </div>
                        )}
                        <div id='submit' onClick={() => getReply()}><i className='fa-solid fa-paper-plane'></i></div>
                    </div>
                </div>
                <p className='info'>
                    CogniSphere can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;
