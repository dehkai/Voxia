export const fetchChatbotResponse = async (message,email) => {
    try {
        const cleanMessage = message.startsWith('/') ? message.slice(1) : message;
        
        const response = await fetch(`${process.env.REACT_APP_RASA_SDK_URL}/webhooks/rest/webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                sender: email   , 
                message: cleanMessage 
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to communicate with Rasa server");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending message to Rasa:", error);
        return [];
    }
};