import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { Terminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

import shellSocketStore from "../Store/shellSocketStore";
import containerIdStore from "../Store/containerIdStore";

export const ShellComponent = () => {
  const setWs = shellSocketStore((state) => state.setWs);
  const setContainerId = containerIdStore((state) => state.setContainerId);
  const containerIdRef = useRef(null);

  const terminal = useRef(null);

  const { playgroundId } = useParams();
  const [searchParams] = useSearchParams();
  const environment = searchParams.get("environment");

  const ws = new WebSocket(
    "ws://localhost:3000/shell/?playgroundId=" + encodeURIComponent(playgroundId as string) + "&environment=" + encodeURIComponent(environment as string)
  );

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      theme: {
        background: "#282a36",
        foreground: "#f8f8f2",
        cyan: "#8be9fd",
        green: "#50fa7b",
        yellow: "#f1fa8c",
        red: "#ff5555",
        cursor: "#f8f8f2",
        cursorAccent: "#282a36",
      },
      fontSize: 16,
      fontFamily: "Ubuntu Mono, monospace",
    });
    term.open(terminal.current!);
    let fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();
    ws.onmessage = (msg) => {
      // If message is received, then WS must be open.
      // We check containerIdRef.current so that the reference is always
      // up to date.
      if (!containerIdRef.current) {
        const data = JSON.parse(msg.data);
        if (data.type === "containerId") {
          setContainerId(data.payload.containerId);
          containerIdRef.current = data.payload.containerId;
          // Attach terminal to WS only after the first message is received
          // so the terminal is not confused by the containerId message.
          const attachAddon = new AttachAddon(ws);
          term.loadAddon(attachAddon);
          setWs(ws);
        }
      }
    };
    return () => {
      term.dispose();
    };
  }, []);

  return (
    <div
      style={{
        height: "23vh",
        overflow: "auto",
      }}
      ref={terminal}
      className="terminal"
      id="terminal-container"
    />
  );
};
