import React, { useState } from 'react';
import './Page.css'; // Import the CSS file for page styling

const Contact = () => {
    const [questionData, setQuestionData] = useState({
        email: '',
        question: ''
    });
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!questionData.question.trim() || !questionData.email.trim()) return;

        try {
            await fetch('http://localhost:3001/api/contact/question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: questionData.email,
                    question: questionData.question
                }),
            });

            setQuestionData({ email: '', question: '' });
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error('Error submitting question:', error);
        }
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setQuestionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        try {
            await fetch('http://localhost:3001/api/contact/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feedback }),
            });

            setFeedback('');
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <div className="page-content">
            <h1>Contact Page</h1>
            <p>Here you can ask any inquiries and we will get back to you very soon.</p>
            
            <div className="contact-section">
                <h2>Ask a Question</h2>
                <form onSubmit={handleQuestionSubmit}>
                    <div className="form-group">
                        <label>Your Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={questionData.email}
                            onChange={handleQuestionChange}
                            placeholder="Enter your email for reply"
                            className="email-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Question:</label>
                        <textarea
                            name="question"
                            value={questionData.question}
                            onChange={handleQuestionChange}
                            placeholder="Type your question here..."
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Submit Question
                    </button>
                </form>
            </div>

            <div className="contact-section">
                <h2>Provide Feedback</h2>
                <form onSubmit={handleFeedbackSubmit}>
                    <div className="form-group">
                        <label>Your Feedback:</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Share your experience or suggestions..."
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Submit Feedback
                    </button>
                </form>
            </div>

            {submitted && (
                <div className="success-message">
                    Thank you for your submission! We will review it shortly.
                </div>
            )}
        </div>
    );
};

export default Contact;
