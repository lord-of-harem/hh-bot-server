import app from './App';
import PlayerManager from './PlayerManager';

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
    if (err) {
        return console.error(err);
    }

    return console.log(`server is listening on ${port}`);
});

PlayerManager.register('test', 'test');
