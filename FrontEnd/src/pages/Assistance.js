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
            <p>This is the assistance page of our application.</p>

            {/* FAQ Section 1 */}
            <div className="faq-section">
                <h2>Waiting time</h2>
                <div className="question">How do ER estimated wait times work?</div>
                <div className="answer">Emergency room wait times can vary and may not always be exact...</div>

                <div className="question">How much time do I have to wait?</div>
                <div className="answer">You can check your estimated wait time by visiting our website...</div>
            </div>

            {/* FAQ Section 2 */}
            <div className="faq-section">
                <h2>Relaxation Techniques</h2>
                <div className="question">How can I calm down if I feel anxious?</div>
                <div className="answer">Try deep breathing exercises...</div>

                <div className="question">Breathing exercises to reduce stress in the ER.</div>
                <div className="answer">Sit comfortably, close your eyes, and focus on your breath...</div>
            </div>

            {/* FAQ Section 3 */}
            <div className="faq-section">
                <h2>About Care and Symptoms</h2>
                <div className="question">Is there a way to update my symptoms for reassessment?</div>
                <div className="answer">Yes, you can update your symptoms through the website...</div>
            </div>

            {/* FAQ Section 4 */}
            <div className="faq-section">
                <h2>How to Manage a Wound</h2>
                <div className="question">What should I do if my wound is bleeding?</div>
                <div className="answer">Apply gentle pressure to the wound using a clean cloth...</div>

                <div className="question">How to clean my wound at home?</div>
                <div className="answer">Rinse the wound gently with clean water...</div>
            </div>

            {/* FAQ Section 5 */}
            <div className="faq-section">
                <h2>Dietary Restrictions</h2>
                <div className="question">Are there foods to avoid when healing from a wound?</div>
                <div className="answer">Avoid highly processed foods...</div>

                <div className="question">Should I increase my protein intake for faster recovery?</div>
                <div className="answer">Yes, proteins like lean meats...</div>
            </div>
        </div>
    );
};

export default Assistance;