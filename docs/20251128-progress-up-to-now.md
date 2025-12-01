## major

- [x] understand the vercel ai sdk to chat interface, control it. try decouple sdk to ui but it is not so important now - after learning, it is acutally decoupled and the sdk are designed very well
- [x] pull the prepared script
- [x] we need show the thinking, show multiple tool call in 1 user query, show mutliple widgets in 1 user query (mcp tool directly impact widgets) - thinking is not shown becuase of the limitation of vercel ai sdk
- [x] integrate prompts from langgraph
- [x] database integrate
	- [x] schema
	- [x] transaction list
	- [x] all side tables including reference - look at the agent repo design  
- [x] approve + cancel (undo) 
	- [x] single editing -> 1+ time approval
	- [x] medium priority: bulk editing -> 1 time approval (including C(R)UD
- [x] push deployment and showcase

## minor

- lower priority: ui
	- [x] prettier the approval
	- [x] if static live dashboard, we need to show the filter else user will be confused
- lower priority
	- [x] agent should be aware of the dashboard as well
	- [ ] combine the frontend and chat frontend
	- let user update it as well before appoval
	- database migration: remove payee_id, add merchant sthing string
	- widget state management including using ontoolcall callback or use message.parts to pull widgets


## future directions

- generic widget with generic data query (agent touch sql directly?)
- port the langgraph agent if really needed - do we need hook to allow agent aware of the dashboard as well? or directly show the widgets linked with mcp tols? also check the agent repo to see anything need to take knowledge back to learn
	- balance tools
	- query and create tools