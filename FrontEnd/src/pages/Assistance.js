import React, { useEffect } from 'react';
import './Page.css'; // Import the CSS file for page styling
import './Assistance.css'

const Assistance = () => {
    // Adding functionality to handle click event and toggle answers
    useEffect(() => {
        const questions = [...document.querySelectorAll('.question')];
        const listeners = questions.map(item => ({
            item, 
            listener: () => {
                const answer = item.nextElementSibling;
                answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
            }
        }));

        listeners.map(({ item, listener }) => {
            item.addEventListener('click', listener)
        })

        return () => {
            listeners.forEach(({ item, listener }) => {
                item.removeEventListener('click', listener);
            });
        }
    }, []);

    return (
        <div className="page-content">
            <h1>Assistance Page</h1>
            <p>This is the assistance page for answers to frequently asked questions.</p>

            {/* FAQ Section 1 */}
            <div className="faq-section">
                <h2>Waiting time</h2>
                <div className="question">How do ER estimated wait times work?</div>
                <div className="answer">Emergency room wait times can vary and may not always be exact. Patients are seen based on the severity of their injury or illness, with critical cases prioritized first. This ensures those in the most urgent need receive immediate care. Thank you for your understanding and patience.</div>

                <div className="question">How much time do I have to wait?</div>
                <div className="answer">You can check your estimated wait time by visiting our website and using your ID to log in. If you feel your symptoms have worsened, please report the changes through the website, and a healthcare professional will reassess your case. Thank you for your cooperation.</div>
            </div>

            {/* FAQ Section 2 */}
            <div className="faq-section">
                <h2>Relaxation Techniques</h2>
                <div className="question">How can I calm down if I feel anxious?</div>
                <div className="answer">Try deep breathing exercises: inhale slowly for 4 seconds, hold for 4 seconds, and exhale for 4 seconds. Repeat until you feel calmer.</div>

                <div className="question">Breathing exercises to reduce stress in the ER.</div>
                <div className="answer">Sit comfortably, close your eyes, and focus on your breath. Count to 4 as you inhale, hold for 4 seconds, and exhale for 4 seconds. Repeat.</div>
            </div>

            {/* FAQ Section 3 */}
            <div className="faq-section">
                <h2>About Care and Symptoms</h2>
                <div className="question">Is there a way to update my symptoms for reassessment?</div>
                <div className="answer">Yes, you can update your symptoms through the website, and the nurse will be notified of the changes.</div>
            </div>
        </div>
    );
};

export default Assistance;