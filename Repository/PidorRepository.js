'use strict';

const User = require("../Model/User");
const Promise = require("promise");

module.exports = class PidorRepository {
    constructor(Pidor) {
        this.Pidor = Pidor.getModel();
    }

    /**
     * Store pidor
     * @param chat
     * @param user
     * @returns {boolean}
     */
    store(chat, user) {
        this.Pidor.sync().then(() => {
            return this.Pidor.create({
                chat: chat,
                user: user
            });
        });

        return true;
    }

    /**
     *
     * @param chat
     * @returns {*|Promise}
     */
    get(chat) {
        const p = this.Pidor;

        return new Promise(function (fulfill, reject) {
            p.sync().then(() => {
                let end = new Date(new Date().setHours(23, 59, 59, 999)).toISOString().slice(0, 19).replace('T', ' ');
                let start = new Date(new Date().setHours(0, 0, 0, 0)).toISOString().slice(0, 19).replace('T', ' ');

                const res = p.findAll({
                    where: {
                        chat: chat,
                        updatedAt: {$between: [start, end]},
                    },
                    order: [
                        ['id', 'DESC']
                    ],
                    limit: 1
                });
                fulfill(res);
            });
        });
    }

    /**
     *
     * @param db
     * @param chat
     * @returns {*|Promise}
     */
    top(db, chat) {
        return new Promise(function (fulfill, reject) {
            let year = (new Date()).getFullYear();
            db.query('SELECT count(p.id) c, p.user, u.first_name, u.last_name, u.username FROM pidors p LEFT JOIN users u ON p.user = u.user WHERE p.chat = ' + chat + ' AND YEAR(p.updatedAt ) = ' + year + ' GROUP BY p.user, u.first_name, u.last_name, u.username ORDER BY c DESC LIMIT 10').spread((results, metadata) => {
                fulfill(results);
            })
        });
    }

    pidorCount(db, user, chat) {
        const sql = 'SELECT COUNT(id) as count FROM pidors WHERE user = :user: AND chat = :chat: LIMIT 1'.replace(':user:', user).replace(':chat:', chat);
        return new Promise(function (fulfill) {
            db.query(sql).spread((results, metadata) => {
                let count = results.length > 0 ? results[0].count : 0;
                fulfill(count);
            })
        });
    }
};
