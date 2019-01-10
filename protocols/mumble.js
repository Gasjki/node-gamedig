const Core = require('./core');

class Mumble extends Core {
    constructor() {
        super();
        this.options.socketTimeout = 5000;
    }

    async run(state) {
        const json = await this.withTcp(async socket => {
            return await this.tcpSend(socket, 'json', (buffer) => {
                if (buffer.length < 10) return;
                const str = buffer.toString();
                let json;
                try {
                    json = JSON.parse(str);
                } catch (e) {
                    // probably not all here yet
                    return;
                }
                return json;
            });
        });

        state.raw = json;
        state.name = json.name;

        let channelStack = [state.raw.root];
        while(channelStack.length) {
            const channel = channelStack.shift();
            channel.description = this.cleanComment(channel.description);
            channelStack = channelStack.concat(channel.channels);
            for(const user of channel.users) {
                user.comment = this.cleanComment(user.comment);
                state.players.push(user);
            }
        }
    }

    cleanComment(str) {
        return str.replace(/<.*>/g,'');
    }
}

module.exports = Mumble;
