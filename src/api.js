// @flow

const fetch = require("node-fetch");
const through2 = require("through2");

import type { Team } from "./utils/auth";

const login = async (token: string): Promise<?Team> => {
  const res = await fetch("https://login.mechmania.io", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error("An unknown error occurred on the server " + res.status);
  return await res.json();
};

const register = async (name: string, email: string): Promise<?Team> => {
  const res = await fetch("https://register.mechmania.io", {
    body: JSON.stringify({ name, email }),
    method: "POST"
  });
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error("An unknown error occurred on the server " + res.status);
  return await res.json();
};

const push = async (team: ?Team, script: ReadableStream): Promise<?Team> => {
  if (!team) {
    throw new Error("Not logged in");
  }

  const res = await fetch("http://scripts.mechmania.io", {
    method: "POST",
    body: script.pipe(through2()),
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });

  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error("An unknown error occurred on the server " + res.status);
  return await res.json();
};

const log = async (team: ?Team): Promise<?Team> => {
  const res = await fetch("https://logpull.mechmania.io", {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error("An unknown error occurred on the server " + res.status);
  return res.text();
};

const play = async (script: ReadableStream): Promise<?Team> => {
  const res = await fetch("http://play.mechmania.io", {
    method: "POST",
    body: script.pipe(through2())
  });
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error("An unknown error occurred on the server " + res.status);
  return res.text();
};

module.exports = {
  login,
  register,
  push,
  log,
  play
};
