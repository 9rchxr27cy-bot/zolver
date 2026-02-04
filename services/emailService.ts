// Email Service for sending transactional emails via EmailJS
// Documentation: https://www.emailjs.com/docs/sdk/installation/

// TODO: Replace with your actual EmailJS credentials
const SERVICE_ID = 'PLACEHOLDER_SERVICE_ID';
const TEMPLATE_ID_NEW_ORDER = 'PLACEHOLDER_TEMPLATE_NEW_ORDER';
const TEMPLATE_ID_OFFER = 'PLACEHOLDER_TEMPLATE_OFFER';
const TEMPLATE_ID_WELCOME = 'PLACEHOLDER_TEMPLATE_WELCOME';
const PUBLIC_KEY = 'PLACEHOLDER_PUBLIC_KEY';

// Optional: Import emailjs if installed
// import emailjs from '@emailjs/browser';

/**
 * Sends an email notification to a Professional when a new Direct Request is made.
 */
export const sendNewOrderEmail = async (
    proEmail: string,
    proName: string,
    clientName: string,
    serviceTitle: string
) => {
    const templateParams = {
        to_email: proEmail,
        to_name: proName,
        client_name: clientName,
        service_title: serviceTitle,
        subject: `Novo Pedido no Zolver: ${serviceTitle}`,
        message: `Olá ${proName}, ${clientName} acabou de solicitar um orçamento direto para você. Abra o app para responder.`
    };

    console.log('📧 [MOCK EMAIL] Enviando Email (New Order):', templateParams);

    // UNCOMMENT TO ENABLE REAL SENDING
    /*
    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_NEW_ORDER, templateParams, PUBLIC_KEY);
        console.log('✅ Email sent successfully');
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
    */
};

/**
 * Sends an email notification to a Client when they receive a new Offer (Proposal).
 */
export const sendOfferReceivedEmail = async (
    clientEmail: string,
    clientName: string,
    proName: string,
    amount: number
) => {
    const templateParams = {
        to_email: clientEmail,
        to_name: clientName,
        pro_name: proName,
        amount: amount,
        subject: `Orçamento Recebido de ${proName}`,
        message: `Olá ${clientName}, ${proName} enviou uma oferta de €{amount}. Acesse para aceitar ou negociar.`
    };

    console.log('📧 [MOCK EMAIL] Enviando Email (Offer Received):', templateParams);

    // UNCOMMENT TO ENABLE REAL SENDING
    /*
    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_OFFER, templateParams, PUBLIC_KEY);
        console.log('✅ Email sent successfully');
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
    */
};

/**
 * Sends a Welcome email to a new user.
 */
export const sendWelcomeEmail = async (
    userEmail: string,
    userName: string
) => {
    const templateParams = {
        to_email: userEmail,
        to_name: userName,
        subject: `Bem-vindo ao Zolver!`,
        message: `Olá ${userName}, bem-vindo à plataforma de serviços mais rápida do mercado.`
    };

    console.log('📧 [MOCK EMAIL] Enviando Email (Welcome):', templateParams);

    // UNCOMMENT TO ENABLE REAL SENDING
    /*
    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_WELCOME, templateParams, PUBLIC_KEY);
        console.log('✅ Email sent successfully');
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
    */
};
