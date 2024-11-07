import Widget from 'rasa-webchat';

function Chat() {
  return (
    <div className="Chat">
      <Widget
        initPayload={"/get_started"}
        socketUrl={"http://<hostname>:5005"}
        socketPath={"/socket.io/"}
        customData={{ "language": "en" }}
        title={"Oncology Assistant"}
      />
    </div>
  );
}

export default Chat;