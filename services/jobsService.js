'use strict';
const {exec} = require('child_process');
const {EventEmitter} = require('events');
const {broadcast} = require("../bin/www");
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const ssh2 = require("ssh2");

exports.jobsGET = function (page, limit) {
    return new Promise(async function (resolve, reject) {
        const {broadcast} = require('../bin/www');
        // Connects to DB and push to it
        const sql = neon(process.env.DATABASE_URL);

        try {
            broadcast("Fetching jobs...");
            const select_jobs_res = await sql`SELECT *
                                              FROM public.jobs`;
            resolve(JSON.parse(JSON.stringify(select_jobs_res)
                .replaceAll("title_name", "title-name")
                .replaceAll("title_id", "title-id")
                .replaceAll("last_pid", "last-pid")));
        } catch (err) {
            console.log(err);
        }

        resolve();
    });
}

exports.jobs_jobResumePOST = function (body) {
    return new Promise(async function (resolve, reject) {
        const {broadcast} = require('../bin/www');
        const emitter = new EventEmitter();
        const ssh2 = require('ssh2');

        let hostIp = process.env.DOCKER_GATEWAY_HOST;
        let hostUser = process.env.HOST_USER_NAME;
        let pathOnHost = undefined;
        let titleName = undefined;

        // Connects to DB and push to it
        const sql = neon(process.env.DATABASE_URL);

        try {
            const select_title_res = await sql`SELECT path_on_host, title_name
                                               FROM public.titles
                                               WHERE id = ${body["title-id"]}`;

            pathOnHost = select_title_res[0]["path_on_host"];
            titleName = select_title_res[0]["title_name"];

            let lastPid = undefined;
            const conn = new ssh2.Client();
            conn.on('ready', () => {
                console.log('Client :: ready :: ' + pathOnHost);
                conn.exec(`bash /home/${hostUser}/relax_tools/scripts/job_launcher.sh -p "` + pathOnHost + '\" &', {x11: true}, (err, stream) => {
                    if (err) throw err;
                    stream.on('close', (code, signal) => {
                        console.log('Stream :: close signal (pursuing) :: code: ' + code + ', signal: ' + signal);
                    }).on('data', async (data) => {
                        lastPid = data.toString();

                        try {
                            broadcast("Updating database");
                            await sql`UPDATE public.jobs
                                      SET last_pid = ${lastPid}
                                      WHERE id = ${body["job-id"]}`;
                        } catch (err) {
                            console.log(err);
                        }
                    }).stderr.on('data', (data) => {
                        console.log('STDERR: ' + data);
                    });
                });
            }).connect({
                host: hostIp,
                port: 22,
                username: hostUser,
                password: process.env.HOST_USER_PASS
            });

            resolve({"status": "ok, running"});
        } catch (error) {
            console.log(error);
            emitter.emit("error", error);
        }
    })
}

exports.jobsPOST = function (body) {
    return new Promise(async function (resolve, reject) {
        const {broadcast} = require('../bin/www');
        const emitter = new EventEmitter();
        const ssh2 = require('ssh2');

        let hostIp = process.env.DOCKER_GATEWAY_HOST;
        let hostUser = process.env.HOST_USER_NAME;
        let pathOnHost = undefined;
        let titleName = undefined;
        let titleLastPid = undefined;

        // Connects to DB and push to it
        const sql = neon(process.env.DATABASE_URL);

        try {
            const select_title_res = await sql`SELECT path_on_host, title_name
                                               FROM public.titles
                                               WHERE id = ${body["title-id"]}`;

            pathOnHost = select_title_res[0]["path_on_host"];
            titleName = select_title_res[0]["title_name"];

            let lastPid = undefined;
            const conn = new ssh2.Client();
            conn.on('ready', () => {
                console.log('Client :: ready :: ' + pathOnHost);
                conn.exec(`bash /home/${hostUser}/relax_tools/scripts/job_launcher.sh -p "` + pathOnHost + '\" &', {x11: true}, (err, stream) => {
                    if (err) throw err;
                    stream.on('close', (code, signal) => {
                        console.log('Stream :: close signal (pursuing) :: code: ' + code + ', signal: ' + signal);
                    }).on('data', async (data) => {
                        console.log(data.toString());
                        lastPid = data.toString();

                        try {
                            broadcast("Updating database");
                            await sql`INSERT INTO public.jobs(title_name, last_pid, title_id)
                                  VALUES (${titleName}, ${lastPid}, ${body["title-id"]})`;
                        } catch (err) {
                            console.log(err);
                        }
                    }).stderr.on('data', (data) => {
                        console.log('STDERR: ' + data);
                    });
                });
            }).connect({
                host: hostIp,
                port: 22,
                username: hostUser,
                password: process.env.HOST_USER_PASS
            });

            resolve({"status": "ok, running"});
        } catch (error) {
            console.log(error);
            emitter.emit("error", error);
        }
    });
}