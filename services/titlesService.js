'use strict';
const { exec } = require('child_process');
const { EventEmitter } = require('events');
const { broadcast } = require("../bin/www");
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

exports.titlesGET = function (page, limit, status) {
    return new Promise(async function (resolve, reject) {
        const { broadcast } = require('../bin/www');
        const ssh2 = require('ssh2');
        const sql = neon(process.env.DATABASE_URL);

        let hostIp = process.env.DOCKER_GATEWAY_HOST;
        let hostUser = process.env.HOST_USER_NAME;

        // Existing paths containing titles on host
        const statusPaths = {
            "Releasing": "/home/loicd/Documents/Mangas/Weekly/",
            "Stuff": "/home/loicd/Documents/Mangas/ENG_no_DRM/",
            "Completed": "/home/loicd/Documents/Mangas/Completed/",
        };
        let statusPathFetched = {};

        // Check parameter if given
        if (statusPaths.hasOwnProperty(status)) {
            statusPathFetched[status] = statusPaths[status];
        } else {
            statusPathFetched = statusPaths;
        }

        // Fetch available titles on host and update the database
        let availableTitles = [];
        const emitter = new EventEmitter();
        Object.values(statusPathFetched).forEach(statusPath => {
            // Connects to host and fetch a path containing title among those given
            broadcast("Fetching titles in \"" + statusPath + "\"");
            const connection = new ssh2.Client();
            connection.on('ready', () => {
                console.log('Client :: ready :: ' + statusPathFetched);
                connection.exec("ls \"" + statusPath + "\"", { x11: true }, (err, stream) => {
                    if (stream) {
                        stream.on('close', (code, signal) => {
                            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                            connection.end();
                        }).on('data', async (data) => {
                            availableTitles = data.toString().split(/\r?\n/).filter(line => line.trim().length > 0);

                            // Connects to DB and push to it
                            try {
                                broadcast("Updating database");
                                for (const title of Object.values(availableTitles)) {
                                    try {
                                        // Insert or update titles in the database
                                        const res =
                                            await sql`INSERT INTO public.titles (title_name, publication_status, path_on_host)
                                                              VALUES (${title},
                                                                      ${Object.keys(statusPathFetched).find(key =>
                                                statusPathFetched[key] === statusPath)},
                                                                      ${statusPath + title}) ON CONFLICT (title_name) DO
                                                              UPDATE SET title_name 
                                                                  = EXCLUDED.title_name, publication_status 
                                                                  = EXCLUDED.publication_status, path_on_host 
                                                                  = EXCLUDED.path_on_host`;
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }

                                emitter.emit("updated");
                            } catch (e) {
                                emitter.emit("error");
                            }
                        });
                    } else {
                        connection.end();
                    }
                })
            }).connect({
                host: hostIp,
                port: 22,
                username: hostUser,
                password: process.env.HOST_USER_PASS
            });

            // Waiting database to be updated
            emitter.on("updated", async () => {
                // The database is fetched so the "id" column of each title has been initisalized
                try {
                    broadcast("Fetching database data");

                    const availableTitlesDatabase = await sql`SELECT * FROM public.titles`;
                    // Replacing property keys to match the RESTFUL kebab-case
                    resolve(JSON.parse(JSON.stringify(availableTitlesDatabase)
                        .replaceAll("title_name", "title-name")
                        .replaceAll("publication_status", "publication-status")
                        .replaceAll("post_treated", "post-treated")));
                } catch (err) {
                    emitter.emit("error");
                }
            });

            emitter.on("error", () => {
                broadcast("Error while connecting to database or fetching data from it");
                resolve({
                    "message": "Error while connecting to database or fetching data from it"
                });
            });
        });
    });
}

exports.titles_titleGET = function (titleId) {
    return new Promise(async function (resolve, reject) {
        // Connects to DB and push to it
        const sql = neon(process.env.DATABASE_URL);
        const emitter = new EventEmitter();
        let title_select_res = undefined;
        try {
            const select_title_name_res = await sql`SELECT *
                                                    FROM public.titles
                                                    WHERE id = ${titleId}`;
            title_select_res = select_title_name_res[0];
        } catch (error) {
            console.log(error);
            emitter.emit("error", error);
        }

        resolve(title_select_res);
    })
}