// @flow

const fetch = require("node-fetch");
const through2 = require("through2");

import type { Team } from "./utils/auth";

const isLoggedIn = team => team && team.token;

const login = async (token: string): Promise<?Team> => {
  const res = await fetch("https://login.mechmania.io", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200) {
    console.error(`ERROR(${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  return await res.json();
};

const register = async (name: string, email: string): Promise<?Team> => {
  const res = await fetch("https://register.mechmania.io", {
    body: JSON.stringify({ name, email }),
    method: "POST"
  });
  if (res.status !== 200) {
    console.error(`ERROR(${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  return await res.json();
};

const push = async (team: ?Team, script: ReadableStream): Promise<?Team> => {
  if (!isLoggedIn(team)) {
    console.error("Not logged in. Run `mm login` or `mm register` first.");
    process.exit(1);
  }
  const res = await fetch("http://push.mechmania.io", {
    method: "POST",
    body: script.pipe(through2()),
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });

  if (res.status === 401) return null;
  if (res.status !== 200) {
    console.error(`ERROR(${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  return await res.json();
};

const log = async (team: ?Team): Promise<?Team> => {
  if (!isLoggedIn(team)) {
    console.error("Not logged in. Run `mm login` or `mm register` first.");
    process.exit(1);
  }
  const res = await fetch("https://logpull.mechmania.io", {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200) {
    console.error(`ERROR(${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  return res.text();
};

const stats = async (
  team: ?Team,
  version: string
): Promise<{ wins: number, losses: number, ties: number }> => {
  if (!isLoggedIn(team)) {
    console.error("Not logged in. Run `mm login` or `mm register` first.");
    process.exit(1);
  }
  const res = await fetch(`https://stats.mechmania.io/${version}`, {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200) {
    console.error(`ERROR(${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  return res.json();
};

const versions = async (team: ?Team): Promise<?Team> => {
  if (!isLoggedIn(team)) {
    console.error("Not logged in. Run `mm login` or `mm register` first.");
    process.exit(1);
  }
  const res = await fetch("https://versions.mechmania.io", {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200) {
    console.error(`ERROR(${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  return res.json();
};

const play = async (script: ReadableStream): Promise<any> => {
  const res = await fetch("http://play.mechmania.io", {
    method: "POST",
    body: script.pipe(through2())
  });
  if (res.status === 401) return null;
  if (res.status !== 200) {
    console.error(`ERROR(${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  return res.text();
};

const teams = async (team: ?Team): Promise<?Array<Team>> => {
  const res = await fetch("http://teams.mechmania.io", {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status === 401) return null;
  if (res.status !== 200) {
    console.error(`ERROR(${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  return res.json();
};

const matches = async (team: ?Team, script: string): Promise<?any> => {
  const res = await fetch(
    `https://mm-matches-xpccfufywb.now.sh/matches/${script}`,
    {
      headers: {
        Authorization: `Bearer ${team.token}`
      }
    }
  );
  if (res.status === 401) return null;
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res.json();
};

const match = async (team: ?Team, match: string): Promise<?any> => {
  const res = await fetch(`https://matches.mechmania.io/${match}`, {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res;
};

const leaderboard = async (team: ?Team): Promise<?any> => {
  const res = await fetch(`https://admin.mechmania.io/leaderboard`, {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res.json();
};

const queueall = async (team: ?Team): Promise<?any> => {
  const res = await fetch(`https://queueall.mechmania.io`, {
    headers: {
      Authorization: `Bearer ${team.token}`
    }
  });
  if (res.status !== 200)
    throw Error(`ERROR(${res.status}): ${await res.text()}`);
  return res;
}

module.exports = {
  login,
  register,
  push,
  log,
  play,
  stats,
  versions,
  teams,
  matches,
  match,
  leaderboard,
  queueall
};
