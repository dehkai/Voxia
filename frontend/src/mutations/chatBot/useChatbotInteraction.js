export const fetchChatbotResponse = async (message) => {
    try {
        const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sender: "user", message }),
        });

        if (!response.ok) {
            throw new Error("Failed to communicate with Rasa server");
        }

        const data = await response.json();
        return data; // Array of bot responses
    } catch (error) {
        console.error("Error sending message to Rasa:", error);
        return [];
    }
};