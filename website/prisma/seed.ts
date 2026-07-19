import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Rich theological body content ──────────────────────────────────────────

const BODY_ANCHOR = `<p>I have lived long enough to watch the weather of life turn quickly. A family sits at breakfast in peace, and by evening they are gathered around a hospital bed. A man builds for thirty years, and a single season undoes what he thought was settled. If you have walked any distance at all, you know that life does not ask our permission before it changes. The question is never whether the storm will come. The question is what holds you when it does.</p><p>The writer of Hebrews reaches for a picture that every fisherman and sailor understands. He says our hope is "an anchor for the soul, firm and secure." Now consider what an anchor actually does. It is not beautiful. No one hangs an anchor on the wall to admire it. An anchor has one job, and it does that job out of sight, beneath the surface, where no one can see it working. When the wind rises and the waves heave the boat, the anchor takes hold of something deeper than the storm. The boat may rock. The boat may strain at the rope. But the boat does not drift onto the rocks, because the anchor has found its grip in ground the storm cannot reach.</p><p>Here is what I want you to notice. The anchor does not stop the storm. It is a mistake — and a cruel one — to tell a believer that if they only had enough faith, the storm would never come. That is not what Scripture promises. The Lord Jesus Himself said, "In this world you will have trouble." He did not say you might; He said you will. The anchor is not given to keep the waves away. The anchor is given so that the waves cannot carry you off.</p><p>And where does this anchor take hold? Not in our circumstances, for circumstances shift like sand. Not in our feelings, for feelings rise and fall with the morning. The anchor of the soul takes hold of God Himself, and specifically of His promise sealed in Jesus Christ. A few verses earlier the writer speaks of two unchangeable things — God's promise and God's oath — and says it is impossible for God to lie. So when our hope grips the character of God, it grips the one thing in all the universe that does not move.</p><p>Let me tell you what this means on an ordinary, difficult day. It means that your security is not measured by how strong your faith feels in the moment. There are nights when faith feels like a thread. There are mornings when you can barely pray. I have known seasons in my own walk when I held on to God with nothing more than a whisper. But hear me: the anchor does not hold because the rope is thick. The anchor holds because the ground is solid. Your salvation does not rest on the strength of your grip on God; it rests on the strength of His grip on you. "I give them eternal life," Jesus said, "and no one will snatch them out of my hand."</p><p>I think of Abraham, whom this very chapter holds up as our example. God promised him a son, and then made him wait until every natural hope was gone. Abraham was old. Sarah was past the age of children. By every earthly measure the promise was impossible. And the Scripture says Abraham "did not waver through unbelief regarding the promise of God, but was strengthened in his faith." How? Not by looking at his own body, which was as good as dead. He looked instead at the One who had spoken. His anchor was not his ability to produce a son. His anchor was the faithfulness of the God who had said, "I will."</p><p>This is the difference between hope as the world uses the word and hope as the Bible uses it. The world says, "I hope it doesn't rain," and means little more than a wish. Biblical hope is not a wish. It is confident expectation grounded in the proven character of God. It is the settled certainty that the One who began a good work will carry it to completion. Hope, in Scripture, is faith stretching its hand toward tomorrow.</p><p>So what do we do with this? When the storm comes, do not be surprised, and do not assume God has abandoned you. The presence of trouble is not the absence of God. Some of the deepest fellowship I have ever known with the Lord came not on the mountaintop but in the valley, in the very middle of the night. The anchor is felt most when the wind is strongest. Fix your hope on what cannot move. If your peace depends on your health, your bank account, your reputation, or the behavior of other people, you have anchored yourself to things that can be carried away. Drop your anchor deeper — in the promises of God, in the finished work of Christ, in the empty tomb. And when your own grip feels weak, remember whose grip truly holds you. On the days you can barely hold on, He is holding on to you.</p><p>I have buried friends. I have prayed with families who lost everything. I have walked through my own valleys. And I tell you from the far side of many storms: the anchor holds. It always holds. Not because we are strong, but because He is faithful. Let the winds do what they will. The soul that is anchored in Christ is firm and secure.</p>`;

const BODY_HOUSE = `<p>When the Lord Jesus finished the greatest sermon ever preached, He did not end with a clever phrase or a soft blessing. He ended with a building site. He told of two men, each of whom built a house. From the outside, I imagine the two houses looked very much alike. Both had walls and a roof. Both had a door that opened and shut. If you had walked past on a sunny afternoon, you might not have been able to tell them apart. The difference between them was hidden, down where no visitor ever looks — in the foundation.</p><p>Then came the storm. And notice carefully: the same storm came to both houses. The rain fell on the wise man and on the foolish man alike. The floods rose against both. The winds beat on both. Jesus is very deliberate here. He does not say the wise man was spared the weather. He says that when the identical storm struck two identical-looking houses, one stood and one fell with a great crash. The difference was never the storm. The difference was the foundation laid long before the first cloud appeared.</p><p>I have given much of my life to the work of marriages and homes, and I have come to believe this little parable is one of the most important things a family can hear. Because every home will face its storm. I have never met a marriage that the rain did not test. Illness comes. Money grows tight. Children wander. Grief visits. Disappointment settles in. The question is not whether your home will face weather. The question is what you are building on while the sun still shines.</p><p>What, then, is the rock? Jesus tells us plainly. "Everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock." The rock is not merely hearing the words of Christ. The foolish man heard them too. The rock is hearing and doing — taking the teaching of Jesus and pressing it down into the daily, unglamorous habits of the home. A foundation is not laid in a day, and it is not laid in public. It is laid quietly, course by course, in the ordinary moments no one applauds.</p><p>Let me make this practical, for a foundation is a practical thing. A home built on the rock is a home where the Word of God is actually obeyed, not merely admired. It is one thing to own a Bible. It is another thing to forgive your spouse because the Bible tells you to forgive. It is one thing to say grace over a meal. It is another to be gracious in the argument after the meal. The rock is laid when a husband loves his wife as Christ loved the church — sacrificially, patiently, putting her good before his comfort. The rock is laid when parents teach their children not only by the verses on the wall but by the way Mother and Father treat each other on a hard Tuesday.</p><p>The sand, by contrast, is everything that looks like a foundation but cannot bear weight. Some build their homes on feelings — and feelings are real, but they are sand; they shift with the season. Some build on money, and money is useful, but I have watched it wash away in a single night. Some build on the approval of others, on appearances, on the assumption that love will simply sustain itself without care. All of it is sand. It holds beautifully in fair weather. It fails completely in the flood.</p><p>I want to speak honestly, because the parable is honest. The foolish man was not lazy. He built a house too. He worked. He simply skipped the slow and hidden labor of digging down to rock. He wanted the house without the foundation, the home without the discipline. And many a family today wants the same — they want a marriage that stands without the daily work of kneeling together, forgiving quickly, speaking gently, and obeying the Word when it is inconvenient. But there is no such house. You cannot skip the foundation and survive the storm.</p><p>Now here is the hope in this teaching, and there is great hope. If your house has been built on sand, you are not without remedy, because the Rock Himself is alive and willing. Christ is the Rock. Any home can begin, today, to dig down to Him. It is never too late to start laying a true foundation. I have seen marriages that were all but washed out rebuilt on Christ and made stronger than they ever were before. The same Lord who gives the warning gives the power to obey it.</p><p>So let me ask you, as I have asked many couples across many years: what are you building on? Not what does your home look like from the street — anyone can manage a tidy front door. What is underneath? Build on the Rock. Hear His words, and do them. Forgive when it is hard. Love when it costs. Pray together when you would rather not speak at all. Lay the foundation now, quietly, while the weather is fair — so that when the storm comes, and the winds beat against your house, your family will still be standing when the sky clears.</p>`;

const BODY_STILL = `<p>There is a verse that many believers can quote but few have truly learned to live: "Be still, and know that I am God." We print it on cards and hang it on walls, and rightly so, for it is a beautiful word. But I fear we often soften it into a gentle suggestion to relax, when in truth it is one of the boldest commands in all of Scripture. To understand it, we must see where it sits, because the setting changes everything.</p><p>Psalm 46 is not a quiet psalm. It opens in chaos. "Though the earth give way and the mountains fall into the heart of the sea, though its waters roar and foam and the mountains quake." This is the language of an earthquake, of a world coming apart at the seams. The psalmist is not sitting in a peaceful garden when he writes these words. He is standing in the middle of collapse. And it is precisely there, in the heart of the storm, that the voice of God breaks in and says, "Be still, and know that I am God."</p><p>So the stillness God commands is not the stillness of an easy life. It is stillness in the very middle of trouble. It is the calm of a heart that has learned to trust the One who holds the mountains. The Hebrew word carries the sense of letting go, of ceasing your striving, of dropping your hands from the wheel you have been gripping so tightly. God is saying: stop your frantic struggling. Stop trying to carry what only I can carry. Be still — and know.</p><p>I have noticed that we human beings have a deep instinct to manage. When trouble comes, our first impulse is to do something, anything, to take control. And much of the time action is good and right. But there are seasons when our endless activity is really a mask for unbelief. We keep moving because we are afraid that if we stop, everything will fall apart — as though the world were held together by our worrying. The command to be still is God's gracious way of prying our fingers off the controls and reminding us who is actually running the universe. He does not say, "Be still and figure it out." He says, "Be still and know that I am God." The stillness is for the sake of the knowing.</p><p>And what are we to know? That He is God — and by clear implication, that we are not. This is the great relief hidden inside the command. So much of our anxiety comes from quietly trying to do God's job. We try to control outcomes we were never meant to control. We carry burdens about the future that belong to Him alone. We lie awake rehearsing problems as though our sleepless vigilance could change them. And the Lord, like a loving father to an exhausted child, says: put it down. Be still. I am God, and I have not stepped off the throne.</p><p>Let me be honest about how hard this is, because I do not want to give you a teaching that sounds easy from a pulpit and proves impossible at home. Stillness does not come naturally to the anxious heart. You cannot simply decide to stop worrying any more than you can decide to stop a river by standing in front of it. Stillness is not the absence of feeling; it is the fruit of trust. We grow still as we grow sure of God. That is why the verse joins stillness and knowing together. The more deeply I know who God is — His power, His goodness, His nearness, His unbroken record of faithfulness — the more my soul can rest, even when my circumstances have not changed at all.</p><p>How, then, do we practice this stillness? Begin with deliberate quiet before the Lord. In a world full of noise, you will not stumble into stillness by accident; you must choose it. Set aside time when the phone is down, the room is quiet, and you are not asking God for anything — simply sitting in His presence, remembering who He is. Many of God's people have lost the art of being quiet before Him. Then, fill the stillness with truth about God. An empty quiet can become a breeding ground for fear. So as you grow still, preach to your own soul: He is a very present help in trouble. He is the Lord of hosts. He is your refuge and strength. And return to stillness again and again. The waters will roar again tomorrow, and you will have to be still again. That is no failure; it is simply the life of faith.</p><p>I think often of how Psalm 46 ends — not with the storm subsiding, but with a great confidence ringing out: "The Lord Almighty is with us; the God of Jacob is our fortress." That is the ground of all our stillness. We are not told to be calm because the danger is small. We are told to be still because our God is great, and He is with us. The mountains may fall into the sea. Let them. The God who holds you does not fall with them. Be still, and know that He is God.</p>`;

const BODY_WORD = `<p>At the end of the book of Joshua there is a sentence that I believe deserves to be underlined in every Bible. After all the battles, all the waiting, all the long years between the promise and its fulfillment, the writer pauses to take stock and says this: "Not one of all the Lord's good promises to Israel failed; every one was fulfilled." Read that slowly. Not one failed. Every one fulfilled. That is the verdict of history on the faithfulness of God.</p><p>Now consider how long Israel had waited for those words to be true. The promise to give Abraham's descendants a land had been spoken centuries earlier, to an old man with no children. Between the promise and this sentence lay generations of delay — slavery in Egypt, the long night of bondage, the wilderness years, the wandering, the doubting, the fear. There were surely many moments when the promise seemed dead. And yet, looking back across the whole sweep of it, the verdict stands: not one good promise of God fell to the ground. Every single one came true, in its time.</p><p>This is the heart of what I want to teach you about the Word of God. The Bible is not, at its core, a book of rules, though it contains commands. It is not merely a book of wisdom, though it is full of wisdom. The Bible is, above all, the record of a promise-keeping God. From Genesis to Revelation it tells one great story: God speaks, and God does what He says. He is the God who keeps His word.</p><p>I want you to grasp why this matters so deeply for your own faith. Your whole Christian life rests on promises you have not yet seen fulfilled. You have been promised that God will never leave you, yet there are days you feel utterly alone. You have been promised that He works all things together for good, yet you are in the middle of a season where you cannot see a single good thing. You have been promised a resurrection and a home with Him forever, yet you stand at the graveside of someone you love and the promise feels very far away. In every one of these moments, your peace will depend on one question: can I trust the One who made the promise?</p><p>And here is where the long story of Scripture becomes such a comfort. We are not asked to trust a God with no track record. We are asked to trust the God of Joshua 21:45 — the God whose promises, across thousands of years and countless impossible situations, have never once failed. When the sea stood as a wall and Israel walked through on dry ground, He was keeping His word. When the walls of Jericho fell, He was keeping His word. When a virgin conceived and a Savior was born in Bethlehem exactly as the prophets foretold, He was keeping His word. And when that Savior rose from the dead on the third day, just as He had said, the God who keeps His word gave the greatest proof the world has ever seen. The empty tomb is God's signature on every promise He has ever made.</p><p>So when you open your Bible, I want you to read it as the living word of a faithful God, not as ancient advice. There is a difference between reading the promises of God as nice sentiments and receiving them as the sworn word of the One who cannot lie. The same God who spoke to Abraham, who led Israel into the land, who raised Jesus from the dead — that God is speaking to you through these pages. And His character has not changed. He is not less faithful to you than He was to them.</p><p>Let me give you some counsel for how to live in light of this. First, learn the promises. You cannot lean on what you do not know. Many of God's people are anxious not because the promises are weak but because they have never taken the time to learn them. Second, hold the promises through the delay. Remember that between the promise and its fulfillment there is almost always a waiting. The delay is not a sign that God has forgotten; it is the very arena in which faith grows. Third, look back and build your faith. When your faith for the future grows weak, look at the past — both the long faithfulness of God in Scripture and the particular faithfulness of God in your own life. A remembered mercy is fuel for present trust.</p><p>I am an old man now, and I can add my own small testimony to the witness of Scripture. Across all the years of my life and ministry, through trials I would not have chosen and valleys I did not understand, I can say with the writer of Joshua: not one of God's good promises to me has failed. He has been faithful every single time. And the God who has kept His word to me, and to all His people through every age, will keep His word to you. You can stake your life on it. Many of us already have.</p>`;

const BODY_GRACE = `<p>I have preached the Gospel for many years, and if I could press one truth into the heart of every person who has ever felt unworthy of God, it would be this small, mighty phrase from the apostle Paul: "Where sin increased, grace increased all the more." Sit with those words. However much sin there is, there is more grace. However deep the stain, the cleansing goes deeper. However far a soul has run, grace runs farther still. This is the very heartbeat of the Gospel, and it is good news for the worst day of your life.</p><p>Paul writes this in the middle of an argument about Adam and Christ. Through one man, Adam, sin entered the world, and with it death, spreading to all of us like a disease in the bloodline. We are not sinners merely because we sin; we sin because we are sinners by nature, born into a fallen race. That is the bad news, and we must be honest about it, because grace means nothing to a person who does not believe they need it. But Paul does not leave us there. He says that just as sin reigned through one man, so grace now reigns through one man, Jesus Christ — and the gift is far greater than the trespass. The remedy is mightier than the disease.</p><p>Now I want to speak directly to a particular person. In every gathering there is someone who is quietly carrying a weight of guilt they believe is too heavy for God to lift. Perhaps that is you. Perhaps there is a sin in your past, or a sin you are still struggling against, and a voice inside whispers that you have gone too far, that you have used up your share of mercy, that grace is for other people but not for one such as you. I want to answer that voice with the word of God. "Where sin increased, grace increased all the more." There is no amount of sin that out-measures the grace of God in Christ. The blood of Jesus is not a limited supply that runs low for the worst sinners. It is an ocean, and no sin has ever exhausted it.</p><p>Look at the people God chose to record in His own book. Look at David, a man after God's own heart, who committed adultery and arranged a man's death — and was forgiven and restored. Look at Peter, who denied his Lord three times with curses on the very night Jesus needed him most — and was met on the shore by a risen Savior who cooked him breakfast and gave him back his calling. Look at Paul himself, who by his own admission persecuted the church — and became the apostle through whom God wrote much of the New Testament. God did not merely tolerate these men. He saved them, used them, and made monuments of His mercy out of them. If grace was greater than their sin, it is greater than yours.</p><p>But let me guard this truth from being twisted, for Paul himself anticipated the danger. In the very next chapter he asks, "Shall we go on sinning so that grace may increase?" And he answers with the strongest words available to him: "By no means!" The grace that forgives sin is also the grace that frees us from sin. Grace is not God shrugging at our sin as though it did not matter. Grace is God dealing with our sin at the most costly price imaginable — the death of His own Son. A grace that cost the blood of Christ is not a cheap permission slip; it is a mighty rescue. And the one who has truly tasted it does not want to run back into the very pit from which he was lifted.</p><p>So how does this truth take hold of a life? It begins with honesty. Grace meets us only when we stop pretending. As long as we excuse our sin, minimize it, or hide it, we hold grace at arm's length. But the moment we come into the light and say, "God, be merciful to me, a sinner," we discover that the light we feared was the light of a Father running to meet us. Confession is not groveling before a reluctant judge. It is coming home to a waiting Father.</p><p>Then comes a settled assurance. So many believers limp through the Christian life under a low cloud of guilt, never quite sure they are accepted, always feeling they must do more to earn God's smile. But that is to insult the cross. If the sacrifice of Jesus was enough — and it was — then you do not need to add your guilt to it. You are not accepted because you have finally become good enough. You are accepted because Christ was good enough in your place. Rest there. And finally comes gratitude that overflows into a changed life. The person who knows how much they have been forgiven becomes the person who loves much. Grace does not make us careless about sin; it makes us tender toward God.</p><p>Whatever you have done, whatever you are, whatever voice tells you that you are beyond reach — hear the word of the Lord. Where sin increased, grace increased all the more. The grace of God in Jesus Christ is greater than your worst sin, deeper than your deepest shame, and wider than the distance you think you have run. Come home. The grace is greater. It is always greater.</p>`;

const BODY_ROAD = `<p>When I was a young minister, I imagined the Christian life would be lived mostly on the mountaintops — one great spiritual victory after another, a steady climb of ever-rising joy. The years have taught me something truer and, in its own way, more wonderful. The Christian life is not mostly mountaintops. It is mostly road. It is a long walk, day after ordinary day, in the same direction — and the great question of that walk is not how fast you run but whether you keep going. That is why Paul's words to the Galatians have become more precious to me with every passing year: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."</p><p>Notice the very honest assumption buried in that verse. Paul does not say, "You might grow weary." He takes it for granted that you will be tempted to. Weariness in doing good is not a sign that something has gone wrong with your faith. It is the common experience of everyone who walks the long road. There is a particular kind of tiredness that comes not from doing evil but from doing good for a long time without seeing the result. The mother who pours herself out for her children year after year. The believer who keeps praying for a wayward loved one who has not yet turned. The servant who keeps showing up to do the quiet, unseen work that no one applauds. To all of them, and to me, and to you, the temptation is the same: to grow weary, to slacken, to quietly give up.</p><p>Why do we grow weary? Often it is because the harvest is delayed. Paul promises a harvest "at the proper time" — and the proper time is God's time, not ours. We sow, and we want to reap by the next morning. But the law of the harvest, which God has written into the whole creation, is that there is always a season between the sowing and the reaping. The farmer who plants in faith does not dig up his seed the next week to see if anything is happening. He waits. He trusts the slow, hidden work going on beneath the soil. And so must we. Much of the good we do is seed planted in ground we cannot see into, and the harvest may not appear for a long time — sometimes not until long after we are gone.</p><p>This is a great encouragement, if we will receive it. It means that the good you are doing is not wasted simply because you cannot yet see the fruit. The kind word, the faithful prayer, the small sacrifice, the patient endurance — none of it falls to the ground. It is seed, and seed has a future. "At the proper time we will reap." The promise is certain; only the timing is hidden. Heaven keeps an account that earth knows nothing about.</p><p>But notice the one condition Paul attaches: "if we do not give up." This is the hinge on which the whole promise turns. The harvest is sure — but it is sure for those who keep walking. The tragedy is not the believer who grows tired; we all grow tired. The tragedy is the believer who quits just before the dawn, who lays down the plow in the final hour of the night, who abandons the field the season before the harvest would have come. How many have given up on a prayer that God was about to answer, surrendered a calling that was about to bear fruit, walked away from a marriage or a ministry in the very season before the breakthrough? Do not give up. The reaping belongs to those who remain.</p><p>Let me give you, then, some help for the long road. First, fix your eyes on the harvest, not on your weariness. Weariness looks down at the next weary step. Faith looks up at the promised harvest. Keep the end in view. Second, do not walk alone. God never designed His people to walk the long road in isolation. We are meant to carry one another's burdens. When your own strength fails, lean on the fellowship of the saints; and when you have strength to spare, lend it to the brother or sister who is flagging beside you. Third, draw your strength from the Lord, not from yourself. Your own resources will run dry; His never do. "Those who hope in the Lord will renew their strength." And finally, take the next step. That is all the long road ever asks of you — not that you finish it today, but that you do not give up today.</p><p>I am near the end of my own long road now, and I can tell you it has been worth every weary mile. The harvest is real. God is faithful to His promise. So do not grow weary in doing good. Keep sowing. Keep walking. Keep showing up. At the proper time — His time — you will reap, if you do not give up.</p>`;

const BODY_PRAY = `<p>When the Lord Jesus taught His disciples about prayer, He did not begin with technique. He began with a relationship. Notice the small word He uses three times in the Sermon on the Mount: "when you pray." Not "if you pray." Jesus simply assumes that prayer will be the native air of His followers, as natural to the believer as breathing. And then He lifts the whole subject onto holy ground with one astonishing word. He tells us to pray to our Father. That single word reframes everything, and I want to spend our time on it, because I believe many of God's children have never truly entered into the privilege it offers.</p><p>Before He tells us how to pray, Jesus tells us how not to. He warns against two errors that were common then and are common now. The first is the prayer of performance — praying to be seen by others, standing on the street corner so that men will admire our piety. Prayer, Jesus says, was never meant to be a performance for an audience of people. So He says, go into your room, close the door, and pray to your Father who is unseen. There is a private prayer, a secret place between the soul and God, that is the engine room of the whole Christian life. What we are on our knees in secret is what we truly are.</p><p>The second error He warns against is the prayer of mere repetition — "babbling like pagans," heaping up empty words, thinking we will be heard because of our many words. Some imagine that prayer is a matter of wearing God down, as though He were a reluctant official who must be pestered into action. Jesus corrects this with a beautiful reason: "Your Father knows what you need before you ask him." Do you see the freedom in that? We do not pray to inform God of things He does not know. We do not pray to twist the arm of a distant deity. We pray to a Father who already knows our need and already loves us, and who invites us to come and talk with Him as a child talks with a good father.</p><p>This is the heart of it, and I want you to feel the weight of the privilege. The God who flung the stars into space, before whom angels veil their faces, the Almighty Maker of heaven and earth — this God invites you to call Him Father. There is no higher honor available to a human being. Under the old covenant, the high priest could enter God's presence only once a year, with blood and trembling. But the Lord Jesus, by His death, has torn the veil in two from top to bottom, and now the lowest, weakest, most ordinary believer may come at any hour, in any need, and say, "Father."</p><p>Then Jesus gives us the model prayer. "Our Father in heaven, hallowed be your name." He is our Father — near, personal, loving. But He is in heaven — exalted, holy, sovereign. True prayer holds both of these together. We come with the confidence of a child and the reverence of a creature before the Holy One. If we lose the nearness, prayer becomes cold and formal. If we lose the reverence, prayer becomes casual and small. The Lord's Prayer keeps us balanced: close enough to say "Father," low enough to say "hallowed be your name."</p><p>Notice, too, the order of the petitions, for the order is itself a teaching. Jesus teaches us to begin not with our needs but with God's glory: your name be honored, your kingdom come, your will be done. Only after we have set our hearts on God's concerns do we turn to our own — daily bread, forgiveness, deliverance from temptation and evil. This is a quiet rebuke to the way we usually pray. We rush in with our list of requests and never lift our eyes to God Himself. Jesus would have us first seek the Father's face before we seek the Father's hand.</p><p>And look how honest the requests are when we do reach them. "Give us today our daily bread." We are taught to depend on God for the most ordinary things — bread for today, like Israel gathering manna, enough for the day and no more. "Forgive us our debts, as we also have forgiven our debtors." Here is a searching word: we cannot hold forgiveness from others with one hand and reach for God's forgiveness with the other. A forgiven heart must be a forgiving heart. "Lead us not into temptation, but deliver us from the evil one." We confess our weakness and ask for protection, acknowledging that we are no match for the enemy on our own.</p><p>So let me give you some simple counsel on prayer, drawn from the Master's own teaching. Keep a secret place — a room, a corner, a quiet hour where you meet with your Father alone. Come as a child; lay aside the idea that you must impress God with fine words. Begin with His glory before you pour out your requests. And pray often, for the word is "when you pray," not "if." I have leaned on prayer through every season of my life, and the Father has never once turned me away. The door He has opened through His Son is always open. He knows your need before you ask. He loves you more than you know. So when you pray — and may it be often — go to your room, close the door, and speak to your Father who sees you in secret. He is listening.</p>`;

const BODY_HONOR = `<p>There is a word in Scripture that, if a family would truly take it to heart, would transform the whole atmosphere of a home. It is the word "honor." Paul writes to the Romans, "Be devoted to one another in love. Honor one another above yourselves." It is a short command, easily read and quickly forgotten, and yet I have come to believe that the presence or absence of honor is the difference between homes that flourish and homes that quietly wither.</p><p>To honor someone is to treat them as valuable, to assign them worth, to hold them in high regard by the way we speak to them and about them, and by the way we treat them when no one is watching. Honor is love with its hat off — love that respects, that esteems, that refuses to take the other person for granted. And Paul adds a phrase that turns the whole thing upside down from the world's way of thinking: "above yourselves." We are to honor one another above ourselves. Not to wait to be honored first. Not to give honor only when it is returned. We are to take the initiative, each one seeking to lift the other higher than himself.</p><p>Now I want to apply this especially to the home, because it is there that honor is most tested and most needed. It is a strange thing about human nature that we will often show more courtesy to a stranger than to the people we love most. We are patient and polite with the acquaintance we see once a month, and short and sharp with the spouse we see every morning. We honor the guest at our door and dishonor the family at our table. Familiarity, which ought to deepen our love, too often erodes our respect. We grow so used to one another that we stop seeing one another, and we begin to take for granted the very people God has given us to cherish.</p><p>Honor pushes against all of that. In a marriage, to honor your spouse is to keep seeing them as a person of great worth, even after thirty years, even after you know all their faults. It is to speak to them with courtesy and not contempt. It is to speak about them, when they are not in the room, with respect rather than complaint. I have noticed that a marriage begins to die long before anyone files a paper; it begins to die when honor leaves — when the tone turns sarcastic, when the eyes begin to roll, when the husband or wife becomes the easy target of every joke. And by the same token, a marriage that seemed cold can begin to come alive again when honor returns.</p><p>Honor is just as vital between parents and children, in both directions. Children are commanded to honor their father and mother — it is the first commandment with a promise attached. But parents, too, must honor their children: not by indulging them, but by treating them as souls of dignity, listening to them, keeping their word to them, disciplining them with respect rather than scorn. A child who is honored learns honor. A child who is constantly belittled learns either to belittle others or to despise himself. Much of what a child will one day be is shaped by whether honor filled the home or was absent from it.</p><p>Why is honor so costly? Because to honor another above myself, I must step down from the throne of my own importance. The natural self wants to be honored, not to give honor. The natural self keeps score, waits to be served, and grows resentful when its worth is not recognized. To obey this command, I must die a little to my pride. This is why honor is not finally a matter of good manners but of the cross. We learn to honor one another by looking at the One who, though He was in very nature God, did not grasp at His own status but humbled Himself, took the form of a servant, and washed His disciples' feet. The Lord of glory honored sinners above Himself, all the way to the cross. When I struggle to honor my spouse, my child, my brother in Christ, I look there, and I find both the pattern and the power.</p><p>Let me make it practical, for honor lives in the details. Honor guards its tongue — it refuses contempt, sarcasm, and the cutting word, and it speaks gently even in disagreement. Honor speaks well of people behind their backs; if you would not say it to their face, do not say it in their absence. Honor keeps its promises, because to break your word to someone is to tell them they do not matter. Honor listens — really listens — because few things say "you are valuable" more loudly than a person who stops and gives you their full attention. Honor remembers to give thanks, refusing to let the people closest to us become the people we appreciate least.</p><p>If you want to know the spiritual temperature of a home, do not listen to what the family says about God in public. Listen to how they speak to one another at the end of a long, hard day. Honor, or its absence, will tell you everything. So I urge you, in your marriage and in your family and in the church of God: be devoted to one another in love, and honor one another above yourselves. Outdo one another in it. Begin today, in your own home, with the very next word you speak. It is a small thing, this matter of honor — and it changes everything.</p>`;

const BODY_HOPE = `<p>We use the word "hope" very loosely. We say we hope the rain will hold off, we hope the journey goes well, we hope things turn out for the best. And in all these everyday uses, hope is little more than a wish — a hope that may very well be disappointed, because it is anchored in nothing more solid than our wanting. But when the apostle Paul speaks of hope in Romans 5, he means something entirely different. He speaks of a hope that "does not put us to shame," a hope that does not disappoint. And he tells us, in a few remarkable verses, where such a hope comes from and how it is forged. What is striking — even shocking — is that he says it is born in the furnace of suffering.</p><p>Listen to the chain Paul lays out: "We also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope." Read that again slowly, because it runs against everything our hearts naturally feel. Paul does not say we grit our teeth through suffering. He says we glory in it — not because suffering is good in itself, but because of what God does through it. Suffering, in the hands of God, is not wasted. It is the very tool He uses to produce in us something we could get no other way.</p><p>Follow the chain link by link. First, suffering produces perseverance. There is a steadfastness, an endurance, a capacity to keep standing under pressure that is simply never developed in an easy life. You cannot learn to endure in comfort. Just as a muscle grows only when it is strained against resistance, so the soul's strength to endure is built only by enduring. The believer who has been through hard seasons and come out still trusting God has a steadiness that cannot be taught in a classroom; it can only be forged in a fire.</p><p>Then, perseverance produces character. The word Paul uses speaks of proven character, the kind of tested quality you find in metal that has been through the refiner's fire and shown to be genuine. When a believer holds on to God through trial after trial and does not let go, something happens deep in the person. They become proven, tested, reliable — the sort of soul whose faith you can trust because it has been through the fire and was not consumed. We trust a bridge that has borne great weight. We trust a faith that has borne great sorrow and still stands.</p><p>And finally, character produces hope. Here is the wonder of it. The very suffering that the world imagines must destroy our hope becomes, in God's economy, the thing that strengthens it. For every time God brings us through a trial, our confidence in Him grows. We look back and see that He held us when we thought we would fall, that He provided when we could see no way, that He was nearer in the valley than on the mountaintop. And that memory becomes fuel for the future. The person who has been carried through deep waters does not fear the next river as they once did, because they have learned by experience that the God who carried them before will carry them again.</p><p>Then Paul makes the great promise: "And hope does not put us to shame." This hope will never be disappointed; it will never leave us standing ashamed, having trusted in vain. And he tells us precisely why: "because God's love has been poured out into our hearts through the Holy Spirit, who has been given to us." There is the foundation. Our hope does not rest on our circumstances improving, nor even on our own strength to endure. It rests on the love of God, poured out — not measured out in drops, but poured out lavishly — into our very hearts by His Spirit. The reason this hope cannot disappoint is that it is rooted in the unchanging love of God, proven once and forever at the cross. God demonstrated His love for us in this, that while we were still sinners, Christ died for us.</p><p>Do you see what this means for the suffering you may be walking through even now? It means your pain is not pointless. I would never stand before hurting people and tell them their suffering does not hurt, or that it does not matter. It hurts, and it matters. But I can tell you, on the authority of God's Word, that in the hands of your loving Father, your suffering is not wasted. He is at work in it, producing endurance, forging character, and deepening a hope that the easy roads of life could never have given you.</p><p>So how shall we live in light of this? When suffering comes, do not assume God has abandoned you; assume instead that He is at work, and ask Him what He would build in you through it. Do not waste your sorrows by becoming bitter; let them do their refining work. Look back often at how God has already carried you, and let each remembered deliverance strengthen your hope. And above all, anchor your hope not in better circumstances but in the love of God poured into your heart, the love that did not spare His own Son for your sake. The hopes of this world will disappoint you in the end; they are built on sand. But the hope God gives, tested in the fire and rooted in His love, will never put you to shame. Hold on to it. It will hold on to you, all the way to glory.</p>`;

const BODY_FRUIT = `<p>The list is not long, but there is something almost overwhelming about reading it slowly. Nine words — love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control. Nine qualities that Paul gathers under a single image: fruit. Not a list of commands, not a checklist of habits, not a set of achievements. Fruit. Paul chooses this word deliberately, and the choice teaches us everything about how Christian character actually grows.</p><p>Consider what fruit is. Fruit is not manufactured; it grows. An orange tree does not work hard to produce oranges. It does not resolve to do better or try harder. It abides in the soil, draws from the water, and the fruit comes in season as the natural expression of what the tree is. This is precisely the picture the Lord Jesus used in the Gospel of John: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing." The secret of the fruit of the Spirit is not more effort. It is deeper abiding.</p><p>This matters enormously, because there is a kind of Christian religion that tries to manufacture love, joy, and peace by sheer willpower. It resolves to be patient. It grits its teeth and tries to be kind. And it is exhausted by noon, because you cannot produce the fruit of the Spirit by striving. You can only bear it by staying close to the vine. The Holy Spirit is not a coach shouting instructions from the sideline. He is a presence living within us, and the fruit He produces is nothing less than the character of Christ being formed in us from the inside out.</p><p>Look again at the nine qualities, because they are not nine independent virtues — they are one integrated cluster, like a bunch of grapes on a single vine. At the center is love, which the apostle elsewhere calls "the greatest of these" and which Jesus said was the sum of the whole law. If love is truly growing in a person, joy and peace are close behind — because the one who genuinely loves God and neighbor discovers a joy that does not depend on circumstances and a peace that passes understanding. Patience flows from love, because love is patient by nature. Kindness and goodness are love in action — love that sees a need and does something about it. Faithfulness is love that keeps its word and stays the course. Gentleness is love in the way it speaks and leads. And self-control is love making choices that protect the whole — keeping the body under discipline so that appetite does not overturn what grace has built.</p><p>I want to be honest about how slowly this fruit grows, because impatient believers can grow discouraged and conclude that the Spirit is not at work in them. Fruit takes time. A farmer who plants a tree does not come back a week later expecting ripe fruit. He may wait years. Character formed by the Spirit is no different. The love, joy, and peace you see in a mature believer were not produced in a month. They were grown through years of trusting, suffering, praying, failing, returning, and trusting again. What the Spirit is building in you is deep and lasting, not quick and shallow, and He does not hurry this work. If you do not feel very patient today, or very joyful, do not assume the Spirit is absent. Assume instead that He is at work beneath the surface, as a gardener works in hidden soil.</p><p>What is your part in all of this? Paul points to three things in the surrounding passage. First, "walk by the Spirit" — an active, ongoing dependence, returning to the Lord again and again, staying close, choosing the Spirit's promptings over the flesh's cravings. Second, "keep in step with the Spirit" — do not race ahead in your own plans, and do not fall back into old patterns; stay in rhythm with what God is doing in this season. Third, feed what you want to grow. A plant grows toward the light. Feed your soul on Scripture, on prayer, on the fellowship of believers — and the things of the Spirit grow. Neglect those things, and feed your appetites instead, and the fruit withers.</p><p>You cannot force fruit to grow. But you can choose the conditions in which it grows — closeness to Christ, obedience to His Word, and the patient trust that says: the Gardener knows what He is doing. The same Spirit who raised Christ from the dead is at work in you today, forming His character, growing His fruit, making you into someone who looks a little more like Jesus than you did a year ago. Stay close to the vine. Bear fruit. And trust the Gardener.</p>`;

const BODY_EVENT_WIDOWS = `<p>Each December, the Life Support Foundation — co-founded and convened by Rev. Mrs. (Dr.) Edith Mpamaugo — opens its doors to the widows of Lagos for a day set apart entirely for them. This year, more than 1,500 women arrived from across the city: some by bus, some on foot, some helped in by younger hands. They came dressed in their best, because they knew they were expected, and they knew they would be honored. That is no small thing for a woman who has lost her husband and, too often, the dignity that can go with a household.</p><p>The day began with praise and prayer, and then came the things that meet immediate needs: a warm meal, free medical screening, and financial gifts distributed by the foundation's team of volunteers. But those who serve at the outreach will tell you that the most important thing that happens is not the food or the money. It is the moment when a woman who has spent months feeling invisible looks around a room full of people who came specifically to see her — and feels seen. Rev. Mrs. Edith moved among the women, greeting them by name where she knew them, taking the hands of those she was meeting for the first time.</p><p>Rev. Isaac led a brief time of Scripture and prayer that brought many in the room to tears — not the tears of grief, but of release. "The Lord has not forgotten you," he told them simply. "You are not alone before Him. He is your strength and your portion." Several women testified afterward that those words had given them something to carry through the coming year. The Life Support Foundation continues to serve Lagos widows year-round. Those who feel led to support this work are warmly encouraged to reach out through the Contact page.</p>`;

const BODY_EVENT_CRUSADE = `<p>There is something that happens in an open-air crusade that cannot quite be replicated indoors. When the lights are set up and the sound carries across the neighborhood, people come who would never walk through a church door — curious, cautious, drawn by something they cannot yet name. That was the atmosphere at this year's gospel crusade, an evening gathering that drew families from across the wider community and from nearby streets who simply followed the sound of singing.</p><p>Rev. Isaac preached from the Gospel of Luke — the account of the prodigal son, the reckless grace of a father who ran down the road, and the feast that followed. His preaching was what those who know him expect: unhurried, honest, and soaked in Scripture. He did not aim at the emotions first; he aimed at the understanding, and the heart followed. By the end of the evening, when he gave the invitation to come forward for prayer, a steady stream of people made their way to the front — some making first commitments, others returning to a faith they had left behind years before.</p><p>Follow-up teams from several local churches were on hand that evening and in the days that followed, and a number of those who came forward have since joined congregations in the area. The crusade was organized with the warm support of neighboring ministers who have long worked alongside Rev. Isaac — a reminder that the Gospel is best proclaimed in fellowship. Those who wish to support or help organize future crusades are warmly invited to get in touch through the Contact page.</p>`;

const BODY_EVENT_MARRIAGE = `<p>Every generation needs to learn what the last generation learned the hard way. That conviction is behind every marriage and family conference Rev. Isaac and Rev. Mrs. Edith Mpamaugo have convened over the years. This summer's gathering brought together couples — some newly married, some with decades behind them — for two days of teaching, honest conversation, and prayer in an atmosphere of warmth and unhurried trust.</p><p>Rev. Isaac opened the first session with what he called "the foundation question": not "are you in love?" but "what are you building on?" He walked the gathering through the parable of the two builders and drew out its implications for the day-to-day choices that determine the climate of a home. Rev. Mrs. Edith led the afternoon session with her characteristic warmth and directness, addressing the wives on the subject of honoring one's husband in the ordinary traffic of a busy household. "Honor is not only for Sundays," she said. "It lives in the tone you choose when you are tired, and in the words you speak about him when he is not in the room." Several couples said later that those words had shifted something in their home the very next morning.</p><p>The closing session was given over to prayer, with couples praying together in a way that many said they had not done in years — or ever. A number of attendees have since written to say the conference marked a turning point in their marriage. Rev. Isaac and Rev. Mrs. Edith remain available to speak at marriage and family gatherings. Those who would like to invite them are encouraged to reach out through the Contact page.</p>`;

const BODY_EVENT_STREET = `<p>There is a kind of ministry that does not wait for people to come to it. It goes to them — to the street, to the doorstep, to the marketplace — because that is often where the person who would never seek out a church actually is. This is the conviction behind the quarterly street evangelism outreach organized through the ministry, and this June's effort was one of the most encouraging in recent memory.</p><p>More than forty volunteers — drawn from several age groups and several local churches — gathered early in the morning for prayer and a brief word before dividing into teams and spreading across the target neighborhoods. They went two by two, carrying Bibles, gospel tracts, and a simple willingness to listen. Some doors did not open. Some conversations were brief. But many more were not: neighbors who had been waiting for someone to ask about their lives, elderly men and women who wanted prayer, young people carrying questions they had not known where to take. The volunteers reported more than thirty homes where they were invited inside to sit and pray.</p><p>One young woman on the outreach team described the day as "the most alive I have felt in my faith in years" — a sentiment echoed by several others. Outreach of this kind keeps the faith from becoming merely private. It reminds the whole community of believers that the Gospel is not a secret to be guarded but a gift to be shared, and that sharing it costs little more than an afternoon and the willingness to knock on a door. The next outreach is being planned for later in the year. Those who would like to join the team are warmly welcome to get in touch.</p>`;

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "changeme123",
    12
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@isaacmpamaugo.org" },
    update: {},
    create: {
      name: "Rev. Isaac Mpamaugo",
      email: process.env.ADMIN_EMAIL ?? "admin@isaacmpamaugo.org",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin user: ${admin.email}`);

  // ─── Pages ──────────────────────────────────────────────────────────────────

  const pages = [
    {
      slug: "home",
      title: "Home",
      metaDescription:
        "Rev. Isaac Mpamaugo | Sermons, Teachings & Ministry — A retired Rev. sharing a lifetime of sermons and Bible teaching.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "hero",
          order: 0,
          content: {
            headline: "Faithful Service.<br/>Timeless Truth.",
            subheadline:
              "For over 50 years, Rev. Isaac Mpamaugo has preached the Gospel and shepherded God’s people. Today he and his wife Rev. Edith Mpamaugo share a lifetime of sermons and teaching with all who are seeking.",
            buttons: [
              { label: "Listen to a Sermon", href: "/sermons", variant: "gold" },
              { label: "Get in Touch", href: "/contact", variant: "ghost" },
            ],
          },
        },
        {
          id: "sec-trust",
          type: "trustStrip",
          order: 1,
          content: {
            stats: [
              { number: "50+", label: "Years in Ministry" },
              { number: "200", label: "Congregations Served" },
              { number: "Hundreds", label: "Sermons & Teachings" },
              { number: "50", label: "Years of Shared Ministry" },
            ],
          },
        },
        {
          id: "sec-features",
          type: "featuresGrid",
          order: 2,
          content: {
            eyebrow: "OUR PURPOSE",
            title: "A Lifetime of Faithfulness",
            features: [
              {
                icon: "book",
                title: "Sermons That Endure",
                description:
                  "Decades of preaching, gathered in one place to encourage your faith whenever you need it.",
              },
              {
                icon: "lamp",
                title: "Rooted in Scripture",
                description:
                  "Clear, practical Bible teaching for everyday Christian living, marriage, and family.",
              },
              {
                icon: "heart",
                title: "A Shared Calling",
                description:
                  "The fruit of a lifetime of ministry by Rev. Isaac and his wife Rev. Mrs. Edith Mpamaugo, side by side.",
              },
            ],
          },
        },
        {
          id: "sec-about-preview",
          type: "aboutPreview",
          order: 3,
          content: {
            eyebrow: "Our Story",
            headline: "A Life Given to the Gospel",
            body: "Rev. Isaac Mpamaugo answered the call to ministry as a young man and has spent his life pointing people to Christ. Alongside his wife Rev. Mrs. Edith Mpamaugo, he has pastored, taught, counseled, and prayed with countless families.",
            extraParagraphs: [
              "Though now retired from the pulpit, his calling has never stopped — it simply found a new way to reach you.",
            ],
            ctaLabel: "Read Their Story",
            ctaLink: "/about",
          },
        },
        {
          id: "sec-sermons-preview",
          type: "sermonsPreview",
          order: 4,
          content: {
            eyebrow: "Recent",
            title: "Sermons & Teachings",
            subtitle: "Messages of hope, faith, and the steadfast love of God.",
            count: 3,
          },
        },
        {
          id: "sec-events-preview",
          type: "eventsPreview",
          order: 5,
          content: {
            eyebrow: "In the field",
            title: "Outreach & Events",
            subtitle:
              "Where the ministry is at work — gatherings, evangelism, and care for the community.",
            count: 3,
          },
        },
        {
          id: "sec-testimonials",
          type: "testimonials",
          order: 6,
          content: {
            title: "What People Say",
            testimonialIds: [],
          },
        },
        {
          id: "sec-cta",
          type: "ctaBand",
          order: 7,
          content: {
            headline: "However far the road, grace reaches further.",
            description:
              "Reach out for prayer, an encouraging word, or to invite Rev. Isaac to minister.",
            buttonLabel: "Get in Touch",
            buttonLink: "/contact",
          },
        },
      ]),
    },
    {
      slug: "about",
      title: "About",
      metaDescription:
        "Our Story | Rev. Isaac Mpamaugo & Rev. Mrs. Edith Mpamaugo — The life and shared ministry of Rev. Isaac Mpamaugo and his wife.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: { headline: "Our Story", subtitle: "" },
        },
        {
          id: "sec-text",
          type: "textContent",
          order: 1,
          content: {
            body: `<p>Rev. Isaac Mpamaugo's life has been marked by one steady conviction: that the Gospel changes everything. He came to faith as a young man and soon after sensed God's unmistakable call to serve. Over the decades that followed he pastored churches, planted and strengthened congregations, and preached across Nigeria, Africa, and many other nations, walking with his people through joys and trials alike.</p><p>His leadership reached well beyond his own pulpit. He served as District Superintendent of the Assemblies of God, Lagos District, and became the first Chairman of the Pentecostal Fellowship of Nigeria (PFN) in Lagos, helping to unite churches across the city during the formative years of 1986 to 1990.</p><p>None of it was done alone. He and his wife Rev. Mrs. (Dr.) Edith Mpamaugo have shared this calling for over 50 years — she is the co-founder and convener of the Life Support Foundation, which since 1996 has cared for vulnerable widows in Lagos, providing free medical outreach, food, and financial empowerment to well over 1,500 widows every year. Together they built a ministry defined less by titles than by faithfulness: showing up, praying long, and loving people through every season.</p><p>Now retired from full-time pastoral duties, Rev. Isaac continues to teach, mentor, and preach when invited. This site is where the sermons and lessons of a lifetime are kept — not as a museum, but as a living well anyone can draw from.</p>`,
          },
        },
        {
          id: "sec-mission",
          type: "missionVision",
          order: 2,
          content: {
            missionTitle: "Our Mission",
            missionBody:
              "To proclaim the Gospel of Jesus Christ plainly and faithfully, to teach the Scriptures so they take root in everyday life, and to encourage every believer to walk closely with God — for as long as the Lord gives us breath.",
            visionTitle: "What We Believe",
            visionBody:
              "We hold to the historic Christian faith in the Pentecostal tradition: the authority of Scripture, salvation by grace through faith in Jesus Christ, the present work and gifts of the Holy Spirit, and the call to love God and neighbor.",
          },
        },
        {
          id: "sec-features",
          type: "featuresGrid",
          order: 3,
          content: {
            title: "Faithfulness, Not Flash",
            subtitle: "What makes this ministry different.",
            features: [
              {
                icon: "depth",
                title: "Depth Over Noise",
                description:
                  "Decades of seasoned, scripture-rooted preaching — not trends.",
              },
              {
                icon: "users",
                title: "A Shared Witness",
                description:
                  "A husband-and-wife ministry that models faith at home, not only from the pulpit.",
              },
              {
                icon: "compass",
                title: "Always Reaching",
                description:
                  "Retirement changed the schedule, not the calling.",
              },
            ],
          },
        },
      ]),
    },
    {
      slug: "ministries",
      title: "Ministries",
      metaDescription:
        "Ministries | Rev. Isaac & Rev. Mrs. Edith Mpamaugo — How they serve through preaching, women's ministry, the Life Support Foundation, missions, and more.",
      sections: JSON.stringify([
        {
          id: "pagehero-ministries",
          type: "pageHero",
          order: 1,
          content: {
            eyebrow: "Ministries",
            headline: "How Rev. Isaac & Rev. Mrs. Edith Serve",
            subtitle:
              "A lifetime of ministry takes many forms. Here are the ways Rev. Isaac and his co-ministry partner Rev. Mrs. Edith Mpamaugo continue to serve the church, the community, and individual believers today.",
          },
        },
        {
          id: "grid-his-ministry",
          type: "grid",
          order: 2,
          content: {
            eyebrow: "Rev. Isaac Mpamaugo",
            title: "His Ministry",
            items: [
              { icon: "🎙️", title: "Preaching", description: "Gospel-centered messages for Sundays, conferences, conventions, and special gatherings — Rev. Isaac's hallmark for over five decades." },
              { icon: "📖", title: "Bible Teaching", description: "Verse-by-verse and topical teaching that makes Scripture clear and applicable to everyday life." },
              { icon: "🌱", title: "Mentoring Ministers", description: "Rev. Isaac invests in younger pastors and church leaders, sharing hard-won wisdom from a lifetime of pastoral ministry." },
            ],
          },
        },
        {
          id: "grid-her-ministry",
          type: "grid",
          order: 3,
          content: {
            eyebrow: "Rev. Mrs. Edith Mpamaugo",
            title: "Her Ministry",
            items: [
              { icon: "❤️", title: "Life Support Foundation", description: "Co-founder and convener of the Life Support Foundation — since 1996 providing medical outreach, food, and empowerment to over 1,500 vulnerable widows in Lagos each year." },
              { icon: "👩‍👧", title: "Ministry to Women & Families", description: "Rev. Mrs. Edith brings decades of wisdom to women's ministry, family life, and pastoral care — a gifted minister in her own right." },
              { icon: "🙏", title: "Prayer & Pastoral Care", description: "A faithful intercessor and counsellor — Rev. Mrs. Edith carries the burdens of God's people with compassion and faith." },
            ],
          },
        },
        {
          id: "grid-shared-ministry",
          type: "grid",
          order: 4,
          content: {
            eyebrow: "Together",
            title: "Their Shared Ministry",
            items: [
              { icon: "💍", title: "Marriage & Family", description: "Wisdom from over 50 years of marriage and ministry — Rev. Isaac and Rev. Mrs. Edith minister together to couples and families." },
              { icon: "✈️", title: "Missions", description: "A heart for the nations: Rev. Isaac and Rev. Mrs. Edith have carried the Gospel across Nigeria, Africa, and beyond." },
              { icon: "⚓", title: "A Lifetime of Faithfulness", description: "Fifty years of standing together — in the pulpit, in the home, in the community. Two callings, one purpose." },
            ],
          },
        },
        {
          id: "steps-ministries",
          type: "steps",
          order: 5,
          content: {
            eyebrow: "Invite Them",
            title: "How to Invite Rev. Isaac or Rev. Mrs. Edith",
            steps: [
              { title: "Reach Out", description: "Send a message through the Contact page with your event, occasion, or need." },
              { title: "We Talk It Through", description: "Dates, theme, audience, and how Rev. Isaac or Rev. Mrs. Edith can best serve your gathering." },
              { title: "They Minister", description: "In person where possible, or by recorded message where not." },
            ],
          },
        },
        {
          id: "faq-ministries",
          type: "faq",
          order: 6,
          content: {
            background: "white",
            eyebrow: "Questions",
            title: "Frequently Asked",
            items: [
              { question: "Are Rev. Isaac or Rev. Mrs. Edith available to preach or speak at events?", answer: "Yes, as their schedule allows. Use the Contact page to share the date, location, and occasion, and we'll respond." },
              { question: "Can I request prayer?", answer: "Absolutely. Send your request through the Contact form. Every request is read and prayed over." },
              { question: "Are the sermons free to share?", answer: "Yes. You're welcome to share them with anyone who would be encouraged by them." },
              { question: "Does Rev. Isaac offer counselling or pastoral advice?", answer: "Rev. Isaac offers prayer and spiritual encouragement. For ongoing pastoral or professional counselling, he's glad to point you to trusted resources." },
              { question: "How can I support the ministry?", answer: "Your prayers and your sharing of these messages are a real encouragement. To give financially, visit the Give page. To partner with the widows' outreach of the Life Support Foundation, mention it in your message." },
            ],
            bottomCtaLabel: "Have something on your heart?",
            bottomCtaLink: "/contact",
          },
        },
      ]),
    },
    {
      slug: "missions",
      title: "Missions",
      metaDescription:
        "Missions | Rev. Isaac & Rev. Mrs. Edith Mpamaugo — Carrying the Gospel across Nigeria, Africa, and beyond. Partner through prayer, giving, and invitation.",
      sections: JSON.stringify([
        {
          id: "pagehero-missions",
          type: "pageHero",
          order: 1,
          content: {
            eyebrow: "Missions",
            headline: "Taking the Gospel to the Nations",
            subtitle: "Rev. Isaac and Rev. Mrs. Edith Mpamaugo have carried the Gospel beyond the walls of any single church — across Nigeria, the African continent, and beyond. Missions is not a programme; it is a conviction.",
          },
        },
        {
          id: "grid-missions-areas",
          type: "grid",
          order: 2,
          content: {
            eyebrow: "Areas of Outreach",
            title: "Where They Have Served",
            items: [
              { icon: "🇳🇬", title: "Nigeria", description: "Evangelistic crusades, church conferences, and pastoral visits across Lagos, the South-East, and beyond." },
              { icon: "🌍", title: "Africa", description: "Rev. Isaac has preached at international conventions and ministry gatherings across West and East Africa." },
              { icon: "✈️", title: "Beyond Africa", description: "Both Rev. Isaac and Rev. Mrs. Edith have ministered in the diaspora — speaking into the lives of Nigerian communities abroad and international congregations." },
              { icon: "🏥", title: "Medical Outreach", description: "The Life Support Foundation's annual widows' outreach brings free medical care, food parcels, and empowerment to over 1,500 widows in Lagos each year." },
              { icon: "👩‍👧", title: "Women & Families", description: "Rev. Mrs. Edith's ministry to women crosses borders and generations — discipling, counselling, and equipping wives, mothers, and daughters." },
              { icon: "🌱", title: "Church Planting & Mentoring", description: "Rev. Isaac has mentored pastors and church leaders across Nigeria, pouring hard-won wisdom into the next generation of ministers." },
            ],
          },
        },
        {
          id: "grid-missions-partner",
          type: "grid",
          order: 3,
          content: {
            eyebrow: "Partner With Us",
            title: "Join the Missionary Work",
            items: [
              { icon: "🙏", title: "Pray", description: "The most important thing. Ask for open doors, travelling mercies, and fruitful ministry every time they go." },
              { icon: "💰", title: "Give", description: "Financial partnership sustains the outreach, the widows' programme, and the costs of travel and ministry. Visit the Give page to partner." },
              { icon: "📣", title: "Share", description: "Spread the sermons, teachings, and testimonies of what God has done — every share is a small act of mission." },
              { icon: "✉️", title: "Invite", description: "Hosting Rev. Isaac or Rev. Mrs. Edith for a crusade, conference, or convention? Reach out via the Contact page." },
            ],
          },
        },
        {
          id: "cta-missions",
          type: "ctaBand",
          order: 4,
          content: {
            headline: "Ready to partner with the mission?",
            description: "Pray, give, share, or invite — every act of partnership counts.",
            buttonLabel: "Get in Touch",
            buttonLink: "/contact",
          },
        },
      ]),
    },
    {
      slug: "give",
      title: "Give",
      metaDescription:
        "Give | Rev. Isaac & Rev. Mrs. Edith Mpamaugo — Partner with the ministry through prayer, financial giving, or volunteering.",
      sections: JSON.stringify([
        {
          id: "pagehero-give",
          type: "pageHero",
          order: 1,
          content: {
            eyebrow: "Give",
            headline: "Partner With This Ministry",
            subtitle: "Every gift — however large or small — sustains the preaching of the Gospel, the widows' outreach, and the teaching ministry of Rev. Isaac and Rev. Mrs. Edith Mpamaugo. Thank you for your generosity.",
          },
        },
        {
          id: "grid-give-impact",
          type: "grid",
          order: 2,
          content: {
            eyebrow: "Why Give?",
            title: "Your Gift at Work",
            items: [
              { icon: "📖", title: "Sermons & Teachings", description: "Keeping this archive free and accessible to everyone — anywhere in the world — so that no one is turned away from the Word of God because they cannot afford it." },
              { icon: "❤️", title: "Widows' Outreach", description: "The Life Support Foundation — co-founded and led by Rev. Mrs. Edith Mpamaugo — reaches over 1,500 vulnerable widows in Lagos each year with free medical care, food, and financial empowerment." },
              { icon: "✈️", title: "Missions & Evangelism", description: "Covering the costs of travel, logistics, and materials so that Rev. Isaac and Rev. Mrs. Edith can continue to take the Gospel to churches, crusades, and communities across Nigeria and beyond." },
            ],
          },
        },
        {
          id: "grid-give-other",
          type: "grid",
          order: 3,
          content: {
            eyebrow: "Other Ways to Give",
            title: "More Than Money",
            items: [
              { icon: "🙏", title: "Prayer Partnership", description: "Commit to praying regularly for the ministry, the missions, and the widows' outreach. This is the most powerful form of partnership we know." },
              { icon: "📣", title: "Share the Messages", description: "Share a sermon or teaching with someone who needs it. Spread the word about the Life Support Foundation's work. Every share extends the reach." },
              { icon: "🤝", title: "Volunteer", description: "Are you in Lagos and want to serve at the annual widows' outreach? Contact us — there is always a place for willing hands." },
            ],
          },
        },
        {
          id: "cta-give",
          type: "ctaBand",
          order: 4,
          content: {
            headline: "Every gift is a seed sown in faith.",
            description: "We are grateful for every partner who stands with this ministry. Get in touch to discuss how you can give.",
            buttonLabel: "Contact Us to Give",
            buttonLink: "/contact",
          },
        },
      ]),
    },
    {
      slug: "ministry",
      title: "Ministry",
      metaDescription:
        "Ministry & Invitations | Rev. Isaac Mpamaugo — Preaching, Bible teaching, prayer, and marriage & family ministry.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: {
            headline: "How Rev. Isaac Serves",
            subtitle:
              "A lifetime of ministry takes many forms. Here are the ways Rev. Isaac continues to serve the church and individual believers today.",
          },
        },
        {
          id: "sec-grid",
          type: "grid",
          order: 1,
          content: {
            items: [
              {
                icon: "cross",
                title: "Preaching",
                description:
                  "Gospel-centered messages for Sundays, conferences, conventions, and special gatherings.",
              },
              {
                icon: "book",
                title: "Bible Teaching",
                description:
                  "Verse-by-verse and topical teaching that makes Scripture clear and applicable.",
              },
              {
                icon: "pray",
                title: "Pastoral Care & Prayer",
                description:
                  "A listening ear, counsel, and faithful prayer for those facing difficulty.",
              },
              {
                icon: "heart",
                title: "Marriage & Family Ministry",
                description:
                  "Wisdom from over 45 years of marriage and ministry, offered with his wife Rev. Mrs. Edith Mpamaugo.",
              },
              {
                icon: "users",
                title: "Mentoring Ministers",
                description:
                  "Encouraging and guiding younger pastors and church leaders.",
              },
              {
                icon: "hands",
                title: "Widows & Community Outreach",
                description:
                  "Through the Life Support Foundation, caring for vulnerable widows in Lagos with free medical outreach, food, and financial empowerment.",
              },
            ],
          },
        },
        {
          id: "sec-steps",
          type: "steps",
          order: 2,
          content: {
            title: "How to Invite Rev. Isaac",
            subtitle:
              "Inviting Rev. Isaac to minister at your event is simple.",
            steps: [
              {
                title: "Reach Out",
                description:
                  "Send a message through the Contact page with your event or need.",
              },
              {
                title: "We Talk It Through",
                description:
                  "Dates, theme, audience, and how he can best serve.",
              },
              {
                title: "He Ministers",
                description:
                  "In person where possible, or by recorded message where not.",
              },
            ],
          },
        },
        {
          id: "sec-faq",
          type: "faq",
          order: 3,
          content: {
            title: "Frequently Asked Questions",
            items: [
              {
                question:
                  "Is Rev. Isaac available to preach or speak at events?",
                answer:
                  "Yes, as his schedule allows. Use the Contact page to share the date, location, and occasion, and we'll respond.",
              },
              {
                question: "Can I request prayer?",
                answer:
                  "Absolutely. Send your request through the Contact form. Every request is read and prayed over.",
              },
              {
                question: "Are the sermons free to share?",
                answer:
                  "Yes. You're welcome to share them with anyone who would be encouraged by them.",
              },
              {
                question:
                  "Does he offer counseling or pastoral advice?",
                answer:
                  "He offers prayer and spiritual encouragement. For ongoing pastoral or professional counseling, he's glad to point you to trusted resources.",
              },
              {
                question: "How can I support the ministry?",
                answer:
                  "Your prayers and your sharing of these messages are a real encouragement. If you'd like to partner with the widows' outreach of the Life Support Foundation, mention it in your message and we'll be glad to share how.",
              },
            ],
          },
        },
      ]),
    },
    {
      slug: "sermons",
      title: "Sermons",
      metaDescription:
        "Sermons & Teachings | Rev. Isaac Mpamaugo — Browse sermons and Bible teachings on faith, family, Scripture, and prayer.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: {
            headline: "Sermons & Teachings",
            subtitle:
              "Messages preached and lessons taught over a lifetime of ministry — on faith, family, Scripture, and the faithfulness of God.",
          },
        },
      ]),
    },
    {
      slug: "events",
      title: "Events",
      metaDescription:
        "Events & Outreach | Rev. Isaac Mpamaugo — Evangelistic gatherings, crusades, conferences, and outreach to widows.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: {
            headline: "Events & Outreach",
            subtitle:
              "A look at the ministry in action — evangelistic gatherings, outreach to the vulnerable, and moments of faith and fellowship.",
          },
        },
      ]),
    },
    {
      slug: "contact",
      title: "Contact",
      metaDescription:
        "Contact | Reverend Isaac Mpamaugo — Request prayer, ask a question, or invite Rev. Isaac to minister.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: {
            headline: "Get in Touch",
            subtitle:
              "Whether you'd like prayer, an encouraging word, or to invite Rev. Isaac to minister, we'd love to hear from you.",
          },
        },
        {
          id: "sec-form",
          type: "contactForm",
          order: 1,
          content: {},
        },
        {
          id: "sec-info",
          type: "contactInfo",
          order: 2,
          content: {},
        },
      ]),
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { sections: page.sections },
      create: page as any,
    });
    console.log(`  ✓ Page: ${page.slug}`);
  }

  // ─── Sermons ────────────────────────────────────────────────────────────────

  const IMG = "https://images.unsplash.com/";
  const sermons = [
    {
      slug: "the-anchor-that-holds",
      title: "The Anchor That Holds",
      description: "Where to stand when life shakes everything you trusted.",
      category: "Faith & Hope",
      scriptureRef: "Hebrews 6:19",
      imageUrl: `${IMG}photo-1500627964684-141351970a7f?auto=format&fit=crop&w=600&q=80`,
      body: BODY_ANCHOR,
      published: true,
    },
    {
      slug: "a-house-built-on-the-rock",
      title: "A House Built on the Rock",
      description: "Building a marriage and home that endure.",
      category: "Family & Marriage",
      scriptureRef: "Matthew 7:24–27",
      imageUrl: `${IMG}photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80`,
      body: BODY_HOUSE,
      published: true,
    },
    {
      slug: "be-still-and-know",
      title: "Be Still and Know",
      description: "Learning to rest in the sovereignty of God.",
      category: "Prayer",
      scriptureRef: "Psalm 46:10",
      imageUrl: `${IMG}photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80`,
      body: BODY_STILL,
      published: true,
    },
    {
      slug: "the-god-who-keeps-his-word",
      title: "The God Who Keeps His Word",
      description: "Tracing God's faithfulness through Scripture.",
      category: "Scripture",
      scriptureRef: "Joshua 21:45",
      imageUrl: `${IMG}photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=600&q=80`,
      body: BODY_WORD,
      published: true,
    },
    {
      slug: "grace-greater-than-our-sin",
      title: "Grace Greater Than Our Sin",
      description: "The heart of the Gospel, plainly told.",
      category: "Faith & Hope",
      scriptureRef: "Romans 5:20",
      imageUrl: `${IMG}photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=600&q=80`,
      body: BODY_GRACE,
      published: true,
    },
    {
      slug: "walking-the-long-road",
      title: "Walking the Long Road",
      description: "Faithfulness over a lifetime, not just a moment.",
      category: "The Christian Life",
      scriptureRef: "Galatians 6:9",
      imageUrl: `${IMG}photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=600&q=80`,
      body: BODY_ROAD,
      published: true,
    },
    {
      slug: "when-you-pray",
      title: "When You Pray",
      description: "A teaching on prayer that is honest and unhurried.",
      category: "Prayer",
      scriptureRef: "Matthew 6:6–9",
      imageUrl: `${IMG}photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=600&q=80`,
      body: BODY_PRAY,
      published: true,
    },
    {
      slug: "honoring-one-another",
      title: "Honoring One Another",
      description: "Love and respect in the Christian home.",
      category: "Family & Marriage",
      scriptureRef: "Romans 12:10",
      imageUrl: `${IMG}photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80`,
      body: BODY_HONOR,
      published: true,
    },
    {
      slug: "hope-that-does-not-disappoint",
      title: "Hope That Does Not Disappoint",
      description: "Why the Christian's hope is secure.",
      category: "Faith & Hope",
      scriptureRef: "Romans 5:3–5",
      imageUrl: `${IMG}photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80`,
      body: BODY_HOPE,
      published: true,
    },
  ];

  for (const sermon of sermons) {
    await prisma.sermon.upsert({
      where: { slug: sermon.slug },
      update: { imageUrl: sermon.imageUrl, body: sermon.body },
      create: sermon,
    });
  }
  console.log(`  ✓ ${sermons.length} sermons`);

  // ─── Teachings ──────────────────────────────────────────────────────────────

  const teachings = [
    {
      slug: "teaching-anchor-that-holds",
      title: "The Anchor That Holds",
      excerpt:
        "When the storms of life pull hard against you, hope in Christ is the anchor that does not drag.",
      category: "Faith & Hope",
      scriptureRef: "Hebrews 6:19",
      imageUrl: `${IMG}photo-1500627964684-141351970a7f?auto=format&fit=crop&w=600&q=80`,
      body: BODY_ANCHOR,
      published: true,
    },
    {
      slug: "teaching-house-built-on-rock",
      title: "A House Built on the Rock",
      excerpt:
        "Two houses, one storm, two very different endings — and the difference was never the storm. It was the foundation.",
      category: "Family & Marriage",
      scriptureRef: "Matthew 7:24–27",
      imageUrl: `${IMG}photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80`,
      body: BODY_HOUSE,
      published: true,
    },
    {
      slug: "teaching-be-still-and-know",
      title: "Be Still and Know",
      excerpt:
        "In a world that will not stop moving, God calls us to a stillness that is not weakness but trust.",
      category: "Prayer",
      scriptureRef: "Psalm 46:10",
      imageUrl: `${IMG}photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80`,
      body: BODY_STILL,
      published: true,
    },
    {
      slug: "teaching-god-who-keeps-his-word",
      title: "The God Who Keeps His Word",
      excerpt:
        "Trace the long story of Scripture and you find one unbroken thread: God keeps His word.",
      category: "Scripture",
      scriptureRef: "Joshua 21:45",
      imageUrl: `${IMG}photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=600&q=80`,
      body: BODY_WORD,
      published: true,
    },
    {
      slug: "teaching-grace-greater-than-sin",
      title: "Grace Greater Than Our Sin",
      excerpt:
        "There is no pit so deep that the grace of God in Christ cannot reach to the bottom of it.",
      category: "Faith & Hope",
      scriptureRef: "Romans 5:20",
      imageUrl: `${IMG}photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=600&q=80`,
      body: BODY_GRACE,
      published: true,
    },
    {
      slug: "teaching-walking-long-road",
      title: "Walking the Long Road",
      excerpt:
        "The Christian life is not a sprint but a long faithfulness — and the harvest belongs to those who do not give up.",
      category: "The Christian Life",
      scriptureRef: "Galatians 6:9",
      imageUrl: `${IMG}photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=600&q=80`,
      body: BODY_ROAD,
      published: true,
    },
    {
      slug: "teaching-when-you-pray",
      title: "When You Pray",
      excerpt:
        "Jesus does not say \"if you pray\" but \"when\" — and then He teaches us to speak to God as a Father.",
      category: "Prayer",
      scriptureRef: "Matthew 6:6–9",
      imageUrl: `${IMG}photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=600&q=80`,
      body: BODY_PRAY,
      published: true,
    },
    {
      slug: "teaching-honoring-one-another",
      title: "Honoring One Another",
      excerpt:
        "A home, a marriage, and a church are all built or broken on one small, costly habit — honoring one another.",
      category: "Family & Marriage",
      scriptureRef: "Romans 12:10",
      imageUrl: `${IMG}photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80`,
      body: BODY_HONOR,
      published: true,
    },
    {
      slug: "teaching-hope-that-does-not-disappoint",
      title: "Hope That Does Not Disappoint",
      excerpt:
        "The world's hopes can disappoint us, but the hope God gives is tested in suffering and never fails.",
      category: "Faith & Hope",
      scriptureRef: "Romans 5:3–5",
      imageUrl: `${IMG}photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80`,
      body: BODY_HOPE,
      published: true,
    },
    {
      slug: "teaching-fruit-of-the-spirit",
      title: "The Fruit of the Spirit",
      excerpt:
        "The character of Christ formed in us is the surest evidence of the Spirit's work in our lives.",
      category: "The Christian Life",
      scriptureRef: "Galatians 5:22–23",
      imageUrl: `${IMG}photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80`,
      body: BODY_FRUIT,
      published: true,
    },
  ];

  for (const teaching of teachings) {
    await prisma.teaching.upsert({
      where: { slug: teaching.slug },
      update: {
        imageUrl: teaching.imageUrl,
        body: teaching.body,
        excerpt: teaching.excerpt,
        category: teaching.category,
        scriptureRef: teaching.scriptureRef,
      },
      create: teaching,
    });
  }
  console.log(`  ✓ ${teachings.length} teachings`);

  // ─── Events ─────────────────────────────────────────────────────────────────

  const events = [
    {
      slug: "christmas-widows-outreach",
      title: "Christmas Widows Outreach Brings Hope to Over 1,500 Widows in Lagos",
      excerpt:
        "More than 1,500 widows were welcomed for a day of care, dignity, and hope through the Life Support Foundation.",
      category: "Outreach",
      date: "2025-12-20",
      imageUrl: `${IMG}photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80`,
      body: BODY_EVENT_WIDOWS,
      published: true,
    },
    {
      slug: "gospel-crusade",
      title: "Gospel Crusade Draws the Community Together in Faith",
      excerpt:
        "An evening of worship, preaching, and prayer that drew families from across the area.",
      category: "Crusades",
      date: "2025-10-15",
      imageUrl: `${IMG}photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80`,
      body: BODY_EVENT_CRUSADE,
      published: true,
    },
    {
      slug: "marriage-family-conference",
      title: "Marriage & Family Conference Strengthens Homes",
      excerpt:
        "Rev. Isaac and Rev. Mrs. Edith shared decades of wisdom with couples and families.",
      category: "Conferences",
      date: "2025-08-22",
      imageUrl: `${IMG}photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80`,
      body: BODY_EVENT_MARRIAGE,
      published: true,
    },
    {
      slug: "street-evangelism-outreach",
      title: "Street Evangelism Outreach Shares Hope Door to Door",
      excerpt:
        "Volunteers went into the community to pray with and encourage neighbors.",
      category: "Evangelism",
      date: "2025-06-10",
      imageUrl: `${IMG}photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80`,
      body: BODY_EVENT_STREET,
      published: true,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        imageUrl: event.imageUrl,
        excerpt: event.excerpt,
        category: event.category,
        title: event.title,
        body: event.body,
      },
      create: event,
    });
  }
  console.log(`  ✓ ${events.length} events`);

  // ─── Testimonials ───────────────────────────────────────────────────────────

  const testimonials = [
    {
      quote:
        "Rev. Mpamaugo's preaching carried our family through our hardest years. His words still steady me today.",
      author: "Grace A.",
      role: "Lagos",
      order: 0,
      published: true,
    },
    {
      quote:
        "He and Rev. Mrs. Edith Mpamaugo didn't just teach us about faith — they showed us what a faithful life looks like.",
      author: "Pastor Daniel O.",
      role: "",
      order: 1,
      published: true,
    },
    {
      quote:
        "Every sermon sends you back to the Scriptures and back to your knees. A true shepherd.",
      author: "Mary E.",
      role: "",
      order: 2,
      published: true,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);

  // ─── Settings ───────────────────────────────────────────────────────────────

  const settings = [
    { key: "siteTitle", value: JSON.stringify("The Ministry of Rev. Isaac Mpamaugo") },
    { key: "tagline", value: JSON.stringify("A lifetime of faithful service, sermons, and teaching") },
    { key: "contactEmail", value: JSON.stringify("hello@isaacmpamaugo.org") },
    { key: "contactPhone", value: JSON.stringify("+234 (0)800 000 0000") },
    { key: "contactLocation", value: JSON.stringify("Lagos, Nigeria") },
    {
      key: "socialLinks",
      value: JSON.stringify({
        facebook: "#",
        youtube: "#",
        instagram: "#",
      }),
    },
    { key: "seoDefaults", value: JSON.stringify({ ogImage: "/og-image.jpg" }) },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`  ✓ ${settings.length} settings`);

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
