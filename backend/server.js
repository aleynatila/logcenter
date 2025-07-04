const fs   = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const express = require('express');
const WebSocket = require('ws');

const HOSTS = JSON.parse(fs.readFileSync('./hosts.json'));
const KEY   = fs.readFileSync(path.join(process.env.HOME, '.ssh/id_rsa'));

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('cors')());
app.use(express.json());

app.get('/hosts', (_, res) => res.json(HOSTS));

// Sync All endpoint
app.post('/sync-all', async (req, res) => {
  console.log('Sync All request received');
  
  try {
    const results = [];
    
    for (const host of HOSTS) {
      if (host.broadcast) {
        console.log(`Sending sync to broadcast: ${host.broadcast}`);
        
        // UDP broadcast komutu çalıştır
        const { exec } = require('child_process');
        const command = `echo -n '{"key":"sync"}' | socat -d -v - UDP-DATAGRAM:${host.broadcast}:4000,broadcast`;
        
        try {
          await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(`Sync error for ${host.name}:`, error);
                results.push({ host: host.name, status: 'error', message: error.message });
                resolve();
              } else {
                console.log(`Sync successful for ${host.name}`);
                console.log('stdout:', stdout);
                console.log('stderr:', stderr);
                results.push({ host: host.name, status: 'success', message: 'Sync command sent' });
                resolve();
              }
            });
          });
        } catch (err) {
          console.error(`Exception for ${host.name}:`, err);
          results.push({ host: host.name, status: 'error', message: err.message });
        }
      } else {
        console.log(`No broadcast IP for ${host.name}`);
        results.push({ host: host.name, status: 'skipped', message: 'No broadcast IP' });
      }
    }
    
    res.json({ success: true, results });
    
  } catch (error) {
    console.error('Sync All error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reboot All endpoint
app.post('/reboot-all', async (req, res) => {
  console.log('Reboot All request received');
  
  try {
    const results = [];
    
    for (const host of HOSTS) {
      if (host.broadcast) {
        console.log(`Sending reboot to broadcast: ${host.broadcast}`);
        
        // UDP broadcast komutu çalıştır
        const { exec } = require('child_process');
        const command = `echo -n '{"key":"reboot"}' | socat -d -v - UDP-DATAGRAM:${host.broadcast}:4000,broadcast`;
        
        try {
          await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(`Reboot error for ${host.name}:`, error);
                results.push({ host: host.name, status: 'error', message: error.message });
                resolve();
              } else {
                console.log(`Reboot successful for ${host.name}`);
                console.log('stdout:', stdout);
                console.log('stderr:', stderr);
                results.push({ host: host.name, status: 'success', message: 'Reboot command sent' });
                resolve();
              }
            });
          });
        } catch (err) {
          console.error(`Exception for ${host.name}:`, err);
          results.push({ host: host.name, status: 'error', message: err.message });
        }
      } else {
        console.log(`No broadcast IP for ${host.name}`);
        results.push({ host: host.name, status: 'skipped', message: 'No broadcast IP' });
      }
    }
    
    res.json({ success: true, results });
    
  } catch (error) {
    console.error('Reboot All error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Per-host Sync endpoint
app.post('/sync/:hostId', async (req, res) => {
  const hostId = req.params.hostId;
  const host = HOSTS.find(h => h.id === hostId);
  
  if (!host) {
    return res.status(404).json({ success: false, error: 'Host not found' });
  }
  
  console.log(`Sync request for host: ${host.name}`);
  
  try {
    if (!host.broadcast) {
      return res.status(400).json({ success: false, error: 'No broadcast IP configured for host' });
    }
    
    console.log(`Sending sync to broadcast: ${host.broadcast}`);
    
    const { exec } = require('child_process');
    const command = `echo -n '{"key":"sync"}' | socat -d -v - UDP-DATAGRAM:${host.broadcast}:4000,broadcast`;
    
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Sync error for ${host.name}:`, error);
          reject(error);
        } else {
          console.log(`Sync successful for ${host.name}`);
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
          resolve();
        }
      });
    });
    
    res.json({ success: true, message: `Sync command sent to ${host.name}` });
    
  } catch (error) {
    console.error(`Sync error for ${host.name}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Per-host Reboot endpoint
app.post('/reboot/:hostId', async (req, res) => {
  const hostId = req.params.hostId;
  const host = HOSTS.find(h => h.id === hostId);
  
  if (!host) {
    return res.status(404).json({ success: false, error: 'Host not found' });
  }
  
  console.log(`Reboot request for host: ${host.name}`);
  
  try {
    if (!host.broadcast) {
      return res.status(400).json({ success: false, error: 'No broadcast IP configured for host' });
    }
    
    console.log(`Sending reboot to broadcast: ${host.broadcast}`);
    
    const { exec } = require('child_process');
    const command = `echo -n '{"key":"reboot"}' | socat -d -v - UDP-DATAGRAM:${host.broadcast}:4000,broadcast`;
    
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Reboot error for ${host.name}:`, error);
          reject(error);
        } else {
          console.log(`Reboot successful for ${host.name}`);
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
          resolve();
        }
      });
    });
    
    res.json({ success: true, message: `Reboot command sent to ${host.name}` });
    
    } catch (error) {
    console.error(`Reboot error for ${host.name}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const httpServer = app.listen(5000, '0.0.0.0', () => console.log('HTTP → :5000 (0.0.0.0)'));
const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', ws => {
  console.log('WebSocket connection established');
  let conn;

  ws.on('message', raw => {
    try {
      const { host, cmd } = JSON.parse(raw.toString());
      console.log(`Received command: ${cmd} for host: ${host}`);
      
      const remote =
        cmd === 'tail'
          ? 'tail -n 100 -F /var/log/nginx/access.log'
          : cmd === 'grep-apk'
          ? "grep 'apk' /var/log/nginx/access.log | tail -n 50"
          : "grep 'manifest' /var/log/nginx/access.log | tail -n 50";

      console.log(`Executing command: ${remote}`);

      conn = new Client();
      conn.on('ready', () => {
        console.log('SSH connection ready');
        conn.exec(remote, (err, stream) => {
          if (err) {
            console.error('Exec error:', err);
            return ws.close(1011, err.message);
          }
          console.log('Command executed successfully');
          stream
            .on('data', d => {
              console.log('Data received:', d.toString().substring(0, 100) + '...');
              ws.send(d.toString());
            })
            .stderr.on('data', d => {
              console.log('Error data:', d.toString());
              ws.send('[ERR] ' + d.toString());
            });
        });
      })
      .on('error', err => {
        console.error('SSH connection error:', err);
        ws.close(1011, err.message);
      })
      .connect({ host, username: 'root', privateKey: KEY, readyTimeout: 5000 });
    } catch (err) {
      console.error('Message parsing error:', err);
      ws.close(1011, err.message);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    conn && conn.end();
  });
});
