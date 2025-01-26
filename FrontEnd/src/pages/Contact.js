import React, { useState } from 'react';
import './Page.css'; // Import the CSS file for page styling

const Contact = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const handleQuestionSubmit = (e) => {
        e.preventDefault();
        // Simulate sending the question to a live person and receiving an answer
        // In a real application, you would send the question to a backend service
        console.log('Question submitted:', question);
        // Here you would send the question to the backend or a global state
        // For now, we'll simulate an immediate answer
        setAnswer('This is a simulated answer to your question.');
    };

    return (
        <div className="page-content">
            <h1>Contact Page</h1>
            <p>Here you can ask any inquiries and we will get back to you very soon.</p>
            
            <h2>Ask a Question</h2>
            <form onSubmit={handleQuestionSubmit}>
                <div>
                    <label>Your Question:</label>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </div>
                <button type="submit">Submit Question</button>
            </form>

            {answer && (
                <div>
                    <h3>Answer:</h3>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

export default Contact;
