import { useEffect, useState } from 'react';
import TailPane from './TailPane';

export default function App() {
  const [hosts, setHosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cmd, setCmd] = useState('tail');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetch(`http://${location.hostname}:5000/hosts`).then(r => r.json()).then(setHosts); }, []);

  // Filtrelenmiş host listesi
  const filteredHosts = hosts.filter(host => 
    host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          flexShrink: 0
        }}>
          <h3 style={{margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold'}}>Sunucular</h3>
          <input
            type="text"
            placeholder="Sunucu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          />
        </div>
        <div style={{flex: 1, overflowY: 'auto'}}>
          {filteredHosts.map(h=>(
            <div key={h.host}
                 style={{
                   padding: '12px 20px',
                   cursor: 'pointer',
                   background: selected === h.host ? 'rgba(255,255,255,0.2)' : 'transparent',
                   borderLeft: selected === h.host ? '4px solid #fff' : '4px solid transparent',
                   transition: 'all 0.3s ease',
                   fontSize: '14px',
                   fontWeight: '500'
                 }}
                 onClick={() => setSelected(h.host)}
                 onMouseEnter={(e) => {
                   if(selected !== h.host) e.target.style.background = 'rgba(255,255,255,0.1)';
                 }}
                 onMouseLeave={(e) => {
                   if(selected !== h.host) e.target.style.background = 'transparent';
                 }}>
              {h.name}
            </div>
          ))}
          {filteredHosts.length === 0 && searchTerm && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              "{searchTerm}" için sonuç bulunamadı
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f7fa',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          background: '#fff',
          borderBottom: '1px solid #e1e8ed',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h2 style={{margin: '0 0 15px 0', color: '#2c3e50', fontSize: '20px'}}>Nginx Log Viewer</h2>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              <button 
                onClick={() => setCmd('tail')}
                style={{
                  padding: '10px 20px',
                  background: cmd === 'tail' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
                  color: cmd === 'tail' ? '#fff' : '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: cmd === 'tail' ? '0 4px 15px rgba(102, 126, 234, 0.4)' : '0 2px 5px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  if(cmd !== 'tail') {
                    e.target.style.background = '#667eea';
                    e.target.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if(cmd !== 'tail') {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#667eea';
                  }
                }}>
                Nginx Logs
              </button>
              <button 
                onClick={() => setCmd('grep-apk')}
                style={{
                  padding: '10px 20px',
                  background: cmd === 'grep-apk' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#fff',
                  color: cmd === 'grep-apk' ? '#fff' : '#f5576c',
                  border: '2px solid #f5576c',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: cmd === 'grep-apk' ? '0 4px 15px rgba(245, 87, 108, 0.4)' : '0 2px 5px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  if(cmd !== 'grep-apk') {
                    e.target.style.background = '#f5576c';
                    e.target.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if(cmd !== 'grep-apk') {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#f5576c';
                  }
                }}>
                grep apk
              </button>
              <button 
                onClick={() => setCmd('grep-manifest')}
                style={{
                  padding: '10px 20px',
                  background: cmd === 'grep-manifest' ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' : '#fff',
                  color: cmd === 'grep-manifest' ? '#2c3e50' : '#17a2b8',
                  border: '2px solid #17a2b8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: cmd === 'grep-manifest' ? '0 4px 15px rgba(23, 162, 184, 0.4)' : '0 2px 5px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  if(cmd !== 'grep-manifest') {
                    e.target.style.background = '#17a2b8';
                    e.target.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if(cmd !== 'grep-manifest') {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#17a2b8';
                  }
                }}>
                grep manifest
              </button>
            </div>
          </div>
          
          {/* Sağ taraf - Butonlar */}
          <div style={{display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-end'}}>
            {/* Per-host buttons - only show when a host is selected */}
            {selected && (
              <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                <button 
                  onClick={async () => {
                    const host = hosts.find(h => h.host === selected);
                    if (!host) return;
                    
                    console.log(`Sync clicked for host: ${host.name}`);
                    
                    try {
                      const response = await fetch(`http://${location.hostname}:5000/sync/${host.id}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      const result = await response.json();
                      
                      if (result.success) {
                        alert(`Sync successful for ${host.name}!\n\nRefreshing logs...`);
                        setRefreshTrigger(prev => prev + 1);
                      } else {
                        alert(`Sync error for ${host.name}: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('Sync error:', error);
                      alert(`Connection error: ${error.message}`);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: '#fff',
                    border: '2px solid #28a745',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 10px rgba(40, 167, 69, 0.4)',
                    minWidth: '80px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 3px 10px rgba(40, 167, 69, 0.4)';
                  }}>
                  Sync
                </button>
                
                <button 
                  onClick={async () => {
                    const host = hosts.find(h => h.host === selected);
                    if (!host) return;
                    
                    if(confirm(`Are you sure you want to REBOOT device ${host.name}?\n\nThis action cannot be undone and will disconnect all active connections!`)) {
                      console.log(`Reboot clicked for host: ${host.name}`);
                      
                      try {
                        const response = await fetch(`http://${location.hostname}:5000/reboot/${host.id}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                          alert(`Reboot command sent to ${host.name}!\n\nDevice is rebooting...`);
                          setRefreshTrigger(prev => prev + 1);
                        } else {
                          alert(`Reboot error for ${host.name}: ${result.error}`);
                        }
                      } catch (error) {
                        console.error('Reboot error:', error);
                        alert(`Connection error: ${error.message}`);
                      }
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
                    color: '#fff',
                    border: '2px solid #dc3545',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 10px rgba(220, 53, 69, 0.4)',
                    minWidth: '80px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 3px 10px rgba(220, 53, 69, 0.4)';
                  }}>
                  Reboot
                </button>
              </div>
            )}
            
            {/* Sync All button */}
            <button 
              onClick={async () => {
                console.log('Sync All clicked');
                
                try {
                  const response = await fetch(`http://${location.hostname}:5000/sync-all`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                    const successCount = result.results.filter(r => r.status === 'success').length;
                    const errorCount = result.results.filter(r => r.status === 'error').length;
                    const skippedCount = result.results.filter(r => r.status === 'skipped').length;
                    
                    let message = `Sync completed!\n`;
                    message += `Successful: ${successCount}\n`;
                    if (errorCount > 0) message += `Errors: ${errorCount}\n`;
                    if (skippedCount > 0) message += `Skipped: ${skippedCount}\n`;
                    message += `\nRefreshing logs...`;
                    
                    alert(message);
                    
                    // Refresh terminal
                    if (selected) {
                      console.log('Refreshing terminal after sync...');
                      setRefreshTrigger(prev => prev + 1);
                    }
                  } else {
                    alert(`Sync error: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Sync error:', error);
                  alert(`Connection error: ${error.message}`);
                }
              }}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: '#fff',
                border: '2px solid #28a745',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                minWidth: '140px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
              }}>
              Sync All
            </button>
          </div>
        </div>

        {/* Terminal Area - TAM EKRAN */}
        <div style={{flex: 1, overflow: 'hidden'}}>
          <TailPane host={selected} cmd={cmd} refreshTrigger={refreshTrigger}/>
        </div>
      </main>
    </div>
  );
}
