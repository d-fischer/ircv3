// region RFC1459
// region 4 Message details
// region 4.1 Connection Registration
// 4.1.1 Password message
export {default as Password} from './Password';

// 4.1.2 Nickname message
export {default as NickChange} from './NickChange';

// 4.1.3 User message
export {default as UserRegistration} from './UserRegistration';

// 4.1.4 Server message
// We can't be a server yet

// 4.1.5 Operator message
export {default as OperLogin} from './OperLogin';

// 4.1.6 Quit message
export {default as ClientQuit} from './ClientQuit';

// 4.1.7 Server Quit message
export {default as ServerQuit} from './ServerQuit';
// endregion

// region 4.2 Channel operations
// 4.2.1 Join message
export {default as ChannelJoin} from './ChannelJoin';

// 4.2.2 Part message
export {default as ChannelPart} from './ChannelPart';

// 4.2.3 Mode message
export {default as Mode} from './Mode';

// 4.2.4 Topic message
export {default as Topic} from './Topic';

// 4.2.5 Names message
export {default as Names} from './Names';

// 4.2.6 List message
export {default as ChannelList} from './ChannelList';

// 4.2.7 Invite message
export {default as ChannelInvite} from './ChannelInvite';

// 4.2.8 Kick message
export {default  as ChannelKick} from './ChannelKick';
// endregion

// region 4.3 Server queries and commands
// TODO
// endregion

// region 4.4 Sending messages
// 4.4.1 Private messages
export {default as PrivateMessage} from './PrivateMessage';

// 4.4.2 Notice messages
export {default as Notice} from './Notice';
// endregion

// region 4.5 User-based queries
// 4.5.1 Who query
export {default as WhoQuery} from './WhoQuery';

// 4.5.2 Whois query
export {default as WhoIsQuery} from './WhoIsQuery';

// 4.5.3 Whowas
export {default as WhoWasQuery} from './WhoWasQuery';
// endregion

// region 4.6 Miscellaneous messages
// 4.6.1 Kill message
export {default as Kill} from './Kill';

// 4.6.2 Ping message
export {default as Ping} from './Ping';

// 4.6.3 Pong message
export {default as Pong} from './Pong';

// 4.6.4 Error message
export {default as Error} from './Error';
// endregion
// endregion

// region 5 Optionals
// 5.1 Away
export {default as Away} from './Away';

// 5.2 Rehash message
export {default as Rehash} from './Rehash';

// 5.3 Restart message
export {default as Restart} from './Restart';

// 5.4 Summon message
// really, would anyone use that?

// 5.5 Users message
// would anyone WANT to have that? it seems like a huge security risk.

// 5.6 Operwall message
export {default as Wallops} from './WallopsMessage';

// 5.7 Userhost message
export {default as UserHostQuery} from './UserHostQuery';

// 5.8 Ison message
export {default as IsOnQuery} from './IsOnQuery';
// endregion
// endregion
