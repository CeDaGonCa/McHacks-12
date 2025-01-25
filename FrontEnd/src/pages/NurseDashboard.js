import React, { useState, useEffect } from 'react';
import './Page.css'; // Import the CSS file for page styling

const NurseDashboard = () => {
    const [patientName, setPatientName] = useState('');
    const [levelOfConcern, setLevelOfConcern] = useState(1);
    const [visitDuration, setVisitDuration] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');

    useEffect(() => {
        // Fetch questions from the backend or a global state
        // For now, we'll simulate fetching questions
        const fetchedQuestions = [
            // Example: { id: 1, text: 'What are the visiting hours?', answer: '' }
        ];
        setQuestions(fetchedQuestions);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add logic to handle the submission of new patient information
        console.log('New patient submitted:', { patientName, levelOfConcern, visitDuration });
        // Clear the form fields after submission
        setPatientName('');
        setLevelOfConcern(1);
        setVisitDuration('');
    };

    const handleAnswerSubmit = (e, questionId) => {
        e.preventDefault();
        // Add logic to handle the submission of an answer
        setQuestions(questions.map(q => q.id === questionId ? { ...q, answer: currentAnswer } : q));
        setCurrentAnswer('');
    };

    return (
        <div className="page-content">
            <h1>Nurse Dashboard</h1>
            <p>Welcome to the nurse dashboard. Here you can manage patient information and other tasks.</p>
            
            <h2>Submit New Patient Information</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Patient Name:</label>
                    <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                    />
                </div>
                <div>
                    <label>Level of Concern (1-5):</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={levelOfConcern}
                        onChange={(e) => setLevelOfConcern(e.target.value)}
                    />
                </div>
                <div>
                    <label>Estimated Doctor Visit Duration (minutes):</label>
                    <input
                        type="number"
                        value={visitDuration}
                        onChange={(e) => setVisitDuration(e.target.value)}
                    />
                </div>
                <button type="submit">Submit Patient</button>
            </form>

            <h2>Answer Questions</h2>
            {questions.length > 0 ? (
                questions.map(question => (
                    <div key={question.id}>
                        <p>{question.text}</p>
                        <form onSubmit={(e) => handleAnswerSubmit(e, question.id)}>
                            <input
                                type="text"
                                value={question.answer || currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                            />
                            <button type="submit">Submit Answer</button>
                        </form>
                        {question.answer && <p>Answer: {question.answer}</p>}
                    </div>
                ))
            ) : (
                <p>No questions available.</p>
            )}
        </div>
    );
};

export default NurseDashboard;
