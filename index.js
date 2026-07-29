const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const OWNER_ID = '1507430860347932843';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('เช็คบอท'),
    new SlashCommandBuilder().setName('clear').setDescription('ลบข้อความ')
        .addIntegerOption(opt => opt.setName('amount').setDescription('จำนวน (1-100)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('kick').setDescription('เตะสมาชิก')
        .addUserOption(opt => opt.setName('target').setDescription('คนที่ต้องการเตะ').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('ban').setDescription('แบนสมาชิก')
        .addUserOption(opt => opt.setName('target').setDescription('คนที่ต้องการแบน').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(`✅ บอทออนไลน์แล้ว: ${client.user.tag}`);
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        return interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
    }

    if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({ content: '❌ เฉพาะเจ้าของบอทเท่านั้นที่ใช้คำสั่งนี้ได้!', ephemeral: true });
    }

    if (commandName === 'clear') {
        try {
            const amount = interaction.options.getInteger('amount');
            if (amount < 1 || amount > 100) {
                return interaction.reply({ content: '❌ ใส่จำนวนระหว่าง 1-100 ครับ', ephemeral: true });
            }
            await interaction.channel.bulkDelete(amount, true);
            return interaction.reply({ content: `🗑️ ลบข้อความ ${amount} ข้อความแล้ว`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ เกิดข้อผิดพลาดในการลบ', ephemeral: true });
        }
    }

    if (commandName === 'kick') {
        try {
            const target = interaction.options.getMember('target');
            if (!target) return interaction.reply({ content: '❌ ไม่พบสมาชิกนี้', ephemeral: true });
            await target.kick();
            return interaction.reply({ content: `👢 เตะเรียบร้อย`, ephemeral: true });
        } catch (error) {
            return interaction.reply({ content: '❌ เตะไม่สำเร็จ', ephemeral: true });
        }
    }

    if (commandName === 'ban') {
        try {
            const target = interaction.options.getUser('target');
            await interaction.guild.members.ban(target);
            return interaction.reply({ content: `🔨 แบนเรียบร้อย`, ephemeral: true });
        } catch (error) {
            return interaction.reply({ content: '❌ แบนไม่สำเร็จ', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);