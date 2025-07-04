import { useEffect } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function TailPane({ host, cmd, refreshTrigger }) {
  useEffect(() => {
    if (!host) {
      console.log('No host selected');
      return;
    }
    
    console.log(`Setting up terminal for host: ${host}, cmd: ${cmd}, refresh: ${refreshTrigger}`);
    const term = new Terminal({
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
      cursorBlink: true,
      scrollback: 10000,
      lineHeight: 1.2
    });
    
    const fit = new FitAddon();
    term.loadAddon(fit);
    
    const termElement = document.getElementById('term');
    if (!termElement) {
      console.error('Terminal element not found');
      return;
    }
    
    term.open(termElement);
    
    // Terminal boyutunu ayarla
    const resizeTerminal = () => {
      setTimeout(() => {
        fit.fit();
      }, 100);
    };
    
    resizeTerminal();
    window.addEventListener('resize', resizeTerminal);
    
    // Hoş geldin mesajı
    term.writeln('\x1b[1;32mLogCenter Terminal Ready\x1b[0m');
    term.writeln('\x1b[1;36mConnecting to server...\x1b[0m');
    if (refreshTrigger > 0) {
      term.writeln('\x1b[1;33mTerminal refreshed after sync operation\x1b[0m');
    }
    term.writeln('');
    
    console.log(`Connecting to WebSocket: ws://${location.hostname}:5000`);
    const ws = new WebSocket(`ws://${location.hostname}:5000`);
    
    ws.onopen = () => {
      console.log('WebSocket connected, sending command:', {host, cmd});
      term.writeln('\x1b[1;32mWebSocket connected successfully!\x1b[0m');
      term.writeln('\x1b[1;33mSending command...\x1b[0m');
      term.writeln('');
      ws.send(JSON.stringify({host, cmd}));
    };
    
    ws.onmessage = e => {
      console.log('Received data:', e.data.substring(0, 100) + '...');
      
      // Log verilerini renklendir
      let data = e.data;
      
      // HTTP status kodlarını renklendir
      data = data.replace(/\s200\s/g, ' \x1b[1;32m200\x1b[0m ');
      data = data.replace(/\s404\s/g, ' \x1b[1;31m404\x1b[0m ');
      data = data.replace(/\s500\s/g, ' \x1b[1;31m500\x1b[0m ');
      data = data.replace(/\s301\s/g, ' \x1b[1;33m301\x1b[0m ');
      data = data.replace(/\s302\s/g, ' \x1b[1;33m302\x1b[0m ');
      
      // IP adreslerini renklendir
      data = data.replace(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g, '\x1b[1;36m$1\x1b[0m');
      
      // Tarihleri renklendir
      data = data.replace(/(\[.*?\])/g, '\x1b[1;35m$1\x1b[0m');
      
      // HTTP metodlarını renklendir
      data = data.replace(/"(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)([^"]*?)"/g, '"\x1b[1;32m$1\x1b[0m$2"');
      
      term.write(data.replace(/\n/g,'\r\n'));
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      term.writeln('\r\n\x1b[1;31mWebSocket connection error!\x1b[0m');
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      term.writeln('\r\n\x1b[1;33mConnection closed\x1b[0m');
    };

    return () => { 
      console.log('Cleaning up WebSocket and terminal');
      window.removeEventListener('resize', resizeTerminal);
      ws.close(); 
      term.dispose(); 
    };
  }, [host, cmd, refreshTrigger]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        padding: '8px 15px',
        borderBottom: '1px solid #333',
        color: '#ecf0f1',
        fontSize: '13px',
        fontWeight: 'bold',
        flexShrink: 0
      }}>
        Terminal - {host ? host : 'Bir sunucu seçin'}
      </div>
      <div 
        id="term" 
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}
