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
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return await res.json();
};

const register = async (name: string, email: string): Promise<?Team> => {
  const res = await fetch("https://register.mechmania.io", {
    body: JSON.stringify({ name, email }),
    method: "POST"
  });
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
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
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
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
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res.text();
};

const stats = async (team: ?Team, version: string): Promise<{wins: number, losses: number, ties: number}> => {
  const res = await fetch(`https://stats.mechmania.io/${version}`, {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res.json();
};

const versions = async (team: ?Team): Promise<?Team> => {
  const res = await fetch("https://versions.mechmania.io", {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res.json();
};

const play = async (script: ReadableStream): Promise<?Team> => {
  const res = await fetch("http://play.mechmania.io", {
    method: "POST",
    body: script.pipe(through2())
  });
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res.json();
};

const teams = async (): Promise<?Team> => {
  const res = await fetch("http://teams.mechmania.io");
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res.json();
};

module.exports = {
  login,
  register,
  push,
  log,
  play,
  stats,
  versions,
  teams
};
