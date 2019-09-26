import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class PlayerCard extends React.Component {
  render() {
    let player = this.props.player;
    let teamData = this.props.teamData;
    let team;

    if (player) {
      team = teamData[player.teamId];
      let teamLogo;
      let teamColorPrimary;
      if (team) {
        teamLogo = <img className="player-team icon"src={team.teamLogo} alt={`${team.name} Logo`} height="50" width="48"></img>
        console.log(team);
        teamColorPrimary = hexToRgb(team.teamColors.primary.color, 0.5);
      }
      var playerInfo = (
        <span className="player-card">
          <div className="player-avatar" style={{backgroundColor: teamColorPrimary}}>
            <button className="close" onClick={() => this.props.removePlayer(player.playerId, this.props.shownPlayers)}>&times;</button>
            <img src={player.headshot} alt={`${player.name} Headshot`} height="350" width="350"></img>
            {player.number ?
              <span className="player-number icon">{player.number}</span>
              : null
            }
            {teamLogo}
            <img className="player-role icon" src={`./images/${player.role}.png`} alt={`${player.role} Role`} height="40" width="48"></img>
          </div>
          <table>
            <thead>
              <tr><th>{player.name}</th></tr>
            </thead>
            <tbody>
              <tr><td>{player.eliminations_avg_per_10m.toFixed(2)}</td></tr>
              <tr><td>{player.deaths_avg_per_10m.toFixed(2)}</td></tr>
              <tr><td>{player.hero_damage_avg_per_10m.toLocaleString(undefined, {maximumFractionDigits: 0})}</td></tr>
              <tr><td>{player.healing_avg_per_10m.toLocaleString(undefined, {maximumFractionDigits: 0})}</td></tr>
              <tr><td>{player.ultimates_earned_avg_per_10m.toFixed(2)}</td></tr>
              <tr><td>{player.final_blows_avg_per_10m.toFixed(2)}</td></tr>
              <tr><td>{formatSeconds(player.time_played_total)}</td></tr>
            </tbody>
          </table>
        </span>
      );
    }

    return (
      <div className="column">
        {playerInfo}
      </div>
    );
  }
}

class AddPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pId: null,
      role: "allRoles",
      teamId: 0,
    }
  }

  setPlayerId = (e) => {
    this.setState({pId: Number(e.target.value)});
  }
  setRole = (e) => {
    this.setState({role: e.target.value});
  }
  setTeamId = (e) => {
    this.setState({teamId: Number(e.target.value)});
  }

  render() {
    let teamData =  this.props.teamData;
    let teamKeys = Object.keys(teamData);
    teamKeys.sort((a,b) => (teamData[a].name > teamData[b].name) ? 1 : ((teamData[b].name > teamData[a].name) ? -1 : 0));

    let playerData = this.props.playerData;
    let playerKeys = Object.keys(playerData);
    if (this.state.role !== "allRoles") {
      playerKeys = playerKeys.filter((e) => { return playerData[e].role  === this.state.role})
    }
    if (this.state.teamId !== 0) {
      playerKeys = playerKeys.filter((e) => { return playerData[e].teamId  === this.state.teamId})
    }
    playerKeys.sort((a,b) => (playerData[a].name.toLowerCase() > playerData[b].name.toLowerCase()) ? 1 : ((playerData[b].name > playerData[a].name) ? -1 : 0));

    return (
      <div className="column add-player-container">
        <div></div>
        <div className="column add-player-forms">
          <h2>Select Player</h2>
          <div className="player-filters">
            <select className="team-filter" onChange={this.setTeamId}>
              <option value='0'>All Teams</option>
              {teamKeys.map((tId) =>
                <option key={tId} value={tId}>{teamData[tId].name}</option>
              )}
            </select>
            <select onChange={this.setRole}>
              <option value="allRoles">All Roles</option>
              <option value="offense">Offense</option>
              <option value="tank">Tank</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div>
            <select className="player-select" onChange={this.setPlayerId} size={playerKeys.length < 10 ? playerKeys.length : 10}>
              {playerKeys.map((pId) =>
                <option key={pId} value={pId} onDoubleClick={this.state.pId ? (() => this.props.addPlayer(this.state.pId)) : null}>{playerData[pId].name}</option>
              )}
            </select>
            <div>
              <button
                onClick={this.state.pId ? (() => this.props.addPlayer(this.state.pId)) : null}>
                Add
              </button>
              <button
                onClick={this.props.exitAddPlayer}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerData: {},
      teamData: {},
      shownPlayers: [],
      addPlayer: true
    }
  }

  componentDidMount() {
    Promise.all([
      fetch('https://api.overwatchleague.com/v2/teams/').then(value => value.json()),
      fetch('https://api.overwatchleague.com/stats/players').then(value => value.json())
    ]).then( ([teamData, playerStats]) => {
      // get player stats
      let tempPlayerData = {};
      for (let player of playerStats.data) {
        tempPlayerData[player.playerId] = player;
      }
      this.setState({playerData: tempPlayerData});

      // get team and player data
      let tempTeamData = {};
      for (let team of teamData.data) {
        tempTeamData[team.id] = {
          name: team.name,
          teamLogo: team.logo.main.svg,
          teamColors: team.colors
        }
        let tempPlayerData = this.state.playerData;
        for (let player of team.players) {
          if (tempPlayerData[player.id]) {
            tempPlayerData[player.id].number = player.number;
            tempPlayerData[player.id].headshot = player.headshot;
            tempPlayerData[player.id].meatName = player.fullName;
          }
          // else { console.log(player.name, player.id, 'has no stats'); }
        }
        this.setState({playerData: tempPlayerData});
      }
      this.setState({ teamData: tempTeamData});
    });
    // this.setState({shownPlayers: [5197]});
  }

  removePlayer = (pId, shownPlayers) => {
    var tempShownPlayers = [];
    for (let player of shownPlayers) {
      if (pId !== player) {
        tempShownPlayers.push(player);
      }
    }
    this.setState({shownPlayers: tempShownPlayers});
  }

  clearPlayers = () => {
    this.setState({shownPlayers: []});
  }

  addPlayer = (pId) => {
    this.setState({shownPlayers: [...this.state.shownPlayers, pId]});
    this.setState({addPlayer: false})
  }

  exitAddPlayer = () => {
    this.setState({addPlayer: false})
  }

  render() {
    return (
      <div className="main-container">
        <h1>Overwatch League Player Stats</h1>
        <button className="add-button main-button" onClick={() => this.setState({addPlayer: true})}>Add Player</button>
        <button className="clear-button main-button" onClick={this.clearPlayers}>Clear</button>
        <div className="stats-container">
          <div className="column stat-labels">
            <div></div>
            <table>
              <thead>
                <tr><th>Stats Per 10 Min</th></tr>
              </thead>
              <tbody>
                <tr><td>Avgerage Eliminations</td></tr>
                <tr><td>Avgerage Deaths</td></tr>
                <tr><td>Hero Damage</td></tr>
                <tr><td>Healing</td></tr>
                <tr><td>Average Ultimates Earned</td></tr>
                <tr><td>Final Blows</td></tr>
                <tr><td>Total Time Played</td></tr>
              </tbody>
            </table>
          </div>
          {this.state.shownPlayers.map((pId) =>
            <PlayerCard
              key={pId}
              player={this.state.playerData[pId]}
              teamData={this.state.teamData}
              removePlayer={this.removePlayer}
              shownPlayers={this.state.shownPlayers}
            />
          )}
          {this.state.addPlayer ?
            <AddPlayer
              playerData={this.state.playerData}
              teamData={this.state.teamData}
              addPlayer={this.addPlayer}
              exitAddPlayer={this.exitAddPlayer}
            />
            : null
          }
        </div>
      </div>
    );
  }
}


// ===============================================


ReactDOM.render(<Main/>, document.getElementById('root'));

function formatSeconds(seconds) {
    var hours   = Math.floor(seconds / 3600);
    var minutes = Math.round((seconds - (hours * 3600)) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function hexToRgb(hex, alpha) {
   hex   = hex.replace('#', '');
   var r = parseInt(hex.length === 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
   var g = parseInt(hex.length === 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
   var b = parseInt(hex.length === 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
   if ( alpha ) {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
   }
   else {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
   }
}
