import React from "react";
import axios from "axios";
import logo from "./logo.svg";
import "./App.css";
declare global {
    interface Window {
        Razorpay: any;
    }
}

function App() {
    function loadScript(src: string) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }

    async function displayRazorpay() {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }
        let databody = {
            amount: 50000,
            currency: "INR",
            receipt: "Receipt no. 3",
            payment_capture: 0,
            notes: {
                notes_key_1: "Tea, Earl Grey, Hot, Coffe",
                notes_key_2: "Tea, Earl Grey… decaf. Coffe",
            },
        };
        
        const result: any = await axios({
            method: "POST",
            url: "http://localhost:3030/api/v1/payment/razorpay/order",
            data: databody,
            headers: { "Content-Type": "application/json" },
        })
            .then(function (response) {
                return response;
            })
            .catch(function (response) {
                return response;
            });

        console.log('error is ', result);
        
        if (!result) {
            alert("Server error. Are you online?");
            return;
        }

        const { amount, id: order_id, currency } = result.data.data;
        const options = {
            key: "rzp_test_KcK1gBXhkFX7l7", // Enter the Key ID generated from the Dashboard
            amount: amount.toString(),
            currency: currency,
            name: "eBullion In.",
            description: "Pay with Razorpay",
            image: { logo },
            order_id: order_id,
            handler: async function (response: any) {  // Only call this callback function on success payments
                const data = {
                    order_id: order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                };
                const result = await axios.post("http://localhost:3030/api/v1/payment/razorpay/pay", data);
                alert(result.data.message);
            },
            prefill: {
                name: "Your Name",
                email: "name@example.com",
                contact: "911234567899",
            },
            notes: {
                address: "123, Maharashta, Corporate Office",
            },
            theme: {
                color: "#61dafb",
            },
        };

        const paymentObject = new window.Razorpay(options);  
        paymentObject.open();
        paymentObject.on("payment.failed", function (response: any) {
            // alert(response.error.code);
            alert(response.error.description);
            // alert(response.error.source);
            // alert(response.error.step);
            // alert(response.error.reason);
            // alert(response.error.metadata.order_id);
            // alert(response.error.metadata.payment_id);
        });
    }
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h3>You can Pay this with Razorpay</h3>

                <button className="App-link" onClick={displayRazorpay}>
                    Pay with Razorpay
                </button>
            </header>
        </div>
    );
}

export default App;
