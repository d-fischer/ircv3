// region RFC1459
// region 4 Message details
// region 4.1 Connection Registration
// 4.1.1 Password message
export { Password } from './Password';

// 4.1.2 Nickname message
export { NickChange } from './NickChange';

// 4.1.3 User message
export { UserRegistration } from './UserRegistration';

// 4.1.4 Server message
// We can't be a server yet

// 4.1.5 Operator message
export { OperLogin } from './OperLogin';

// 4.1.6 Quit message
export { ClientQuit } from './ClientQuit';

// 4.1.7 Server Quit message
export { ServerQuit } from './ServerQuit';
// endregion

// region 4.2 Channel operations
// 4.2.1 Join message
export { ChannelJoin } from './ChannelJoin';

// 4.2.2 Part message
export { ChannelPart } from './ChannelPart';

// 4.2.3 Mode message
export { Mode } from './Mode';

// 4.2.4 Topic message
export { Topic } from './Topic';

// 4.2.5 Names message
export { Names } from './Names';

// 4.2.6 List message
export { ChannelList } from './ChannelList';

// 4.2.7 Invite message
export { ChannelInvite } from './ChannelInvite';

// 4.2.8 Kick message
export { ChannelKick } from './ChannelKick';
// endregion

// region 4.3 Server queries and commands
// TODO add more

// 4.3.4 Time message
export { Time } from './Time';
// endregion

// region 4.4 Sending messages
// 4.4.1 Private messages
export { PrivateMessage } from './PrivateMessage';

// 4.4.2 Notice messages
export { Notice } from './Notice';
// endregion

// region 4.5 User-based queries
// 4.5.1 Who query
export { WhoQuery } from './WhoQuery';

// 4.5.2 Whois query
export { WhoIsQuery } from './WhoIsQuery';

// 4.5.3 Whowas
export { WhoWasQuery } from './WhoWasQuery';
// endregion

// region 4.6 Miscellaneous messages
// 4.6.1 Kill message
export { Kill } from './Kill';

// 4.6.2 Ping message
export { Ping } from './Ping';

// 4.6.3 Pong message
export { Pong } from './Pong';

// 4.6.4 Error message
export { ErrorMessage } from './ErrorMessage';
// endregion
// endregion

// region 5 Optionals
// 5.1 Away
export { Away } from './Away';

// 5.2 Rehash message
export { Rehash } from './Rehash';

// 5.3 Restart message
export { Restart } from './Restart';

// 5.4 Summon message
// really, would anyone use that?

// 5.5 Users message
// would anyone WANT to have that? it seems like a huge security risk.

// 5.6 Operwall message
export { WallopsMessage as Wallops } from './WallopsMessage';

// 5.7 Userhost message
export { UserHostQuery } from './UserHostQuery';

// 5.8 Ison message
export { IsOnQuery } from './IsOnQuery';
// endregion
// endregion

// region IRCv3
// Capability Negotiation
export { CapabilityNegotiation } from './CapabilityNegotiation';

// message-tags
export { TagMessage } from './TagMessage';
// endregion
