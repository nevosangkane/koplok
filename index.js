import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import venom from 'venom-bot';

const confess = []

const app = express()

let session = null;

venom.create({session: "session-nevo"}).then((client) => {
    console.log('Client is ready');
    session = client;
    let splittedMessage = null;
    session.onMessage(async (message) => {
        console.log(message)
        if (message.body){
        confess.forEach((confes) => {
            console.log(confes.from, confes.message, confes)
            if (message.from.split("@")[0] === confes.to){
                session.sendText(confes.from + '@c.us', message.body);
                confess.splice(confes.indexOf(confes), 1);
            }
        });
        if (message.body === 'Hi') {
            await session.sendText(message.from, 'Hello');
        }
        splittedMessage = message.body.split(' ');
        splittedMessage[2] = splittedMessage.slice(2).join(' ');
        console.log(splittedMessage[0])
        if (message.body === ".confess" || splittedMessage[0] === ".confess"){
            let number = message.from.split('@');
            let toNumber = splittedMessage[1];
            let messages = splittedMessage[2];
            console.log(toNumber, messages)
            if (toNumber === undefined){
                return await session.sendText(message.from, 'Mohon isi nomor tujuan');
            }else if (messages === undefined){
                return await session.sendText(message.from, 'Mohon isi pesan');
            }else if (toNumber.length < 10){
                return await session.sendText(message.from, 'Nomor tujuan tidak valid');
            }else if (messages.length < 1){
                return await session.sendText(message.from, 'Pesan tidak valid');
            }else if (parseInt(toNumber) === parseInt(number[0])){  
                return await session.sendText(message.from, 'Tidak bisa mengirim pesan ke nomor sendiri');
            }else if (parseInt(toNumber) == NaN){
                return await session.sendText(message.from, 'Nomor tujuan tidak valid');
            }
            await session.sendText(toNumber + '@c.us', `Ini adalah pesan confess dari ${number[0]}: ${messages}`)
            await session.sendText(message.from, 'Pesan berhasil dikirim');
            confess.push({
                from: number[0],
                to: toNumber,
                message: messages
            });
            }
        }
    });
}).catch((error) => {
    console.log('Error creating client', error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
    });

app.post('/send-message', async (req, res) => {
        const { phone, message } = req.body;
        try {
            await session.sendText(`${phone}@c.us`, message);
            res.status(200).send('Message sent');
        } catch (error) {
            res.status(500).send('Error sending message');
            console.log(error)
        }
    });

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}
);
