#!/usr/bin/env python3
"""
FS Sports Merch Discord Bot - PJ's Operations Assistant
Handles tournament research, packing info, inventory checks, and more.
"""

import os
import json
import discord
from discord.ext import commands
from datetime import datetime

# Bot configuration
TOKEN = os.getenv('DISCORD_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
COMMAND_PREFIX = '!'

# Load tournament data
try:
    with open('tournament-data.json', 'r') as f:
        TOURNAMENTS = json.load(f)
except:
    TOURNAMENTS = [
        {"name": "Community Kick off (KY)", "month": "August", "startDate": "16-17", "state": "KY", "sport": "Soccer", "size": 50, "status": "LOCKED", "crew": "Caleb", "kickback": "$200", "website": "", "contact": ""},
        {"name": "Collein Riley (PA)", "month": "August", "startDate": "16-17", "state": "PA", "sport": "Soccer", "size": 80, "status": "LOCKED", "crew": "Caleb", "kickback": "$300", "website": "", "contact": ""},
        {"name": "Boilingbrook Labor Day Festival", "month": "August", "startDate": "30-Sep 1", "state": "IL", "sport": "Soccer", "size": 60, "status": "LOCKED", "crew": "PJ", "kickback": "$250", "website": "", "contact": ""},
        {"name": "Texas Labor Day Cup", "month": "August", "startDate": "30-Sep 1", "state": "TX", "sport": "Soccer", "size": 40, "status": "NEED FILLED", "crew": "", "kickback": "$150", "website": "", "contact": ""},
        {"name": "Labor Day Kick-off Classic", "month": "August", "startDate": "30-Sep 1", "state": "", "sport": "Soccer", "size": 45, "status": "LOCKED", "crew": "Marlon", "kickback": "$200", "website": "", "contact": ""},
    ]

# Bot setup
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix=COMMAND_PREFIX, intents=intents)

@bot.event
async def on_ready():
    print(f'🏆 FS Sports Merch Bot is online!')
    print(f'Bot Name: {bot.user.name}')
    print(f'Bot ID: {bot.user.id}')
    print(f'Connected to {len(bot.guilds)} servers')
    print('---')

@bot.command(name='help_fs')
async def help_command(ctx):
    """Show all available commands"""
    embed = discord.Embed(
        title="🏆 FS Sports Merch Bot - Commands",
        description="Your tournament operations assistant",
        color=0x00d4ff
    )
    
    embed.add_field(
        name="🔍 Tournament Research",
        value="""
`!tournament [name]` - Search tournament by name
`!tournaments [month]` - List tournaments by month
`!next` - Show upcoming tournaments
`!locked` - Show locked tournaments
`!needfilled` - Show tournaments needing crew
        """,
        inline=False
    )
    
    embed.add_field(
        name="📦 Packing & Inventory",
        value="""
`!packing [tournament]` - Get packing list for tournament
`!inventory` - Check current inventory levels
`!jerseys [type]` - Check jersey stock (ronaldo/yamal/mbappe/messi)
        """,
        inline=False
    )
    
    embed.add_field(
        name="👥 Crew & Operations",
        value="""
`!crew [name]` - Show crew member assignments
`!state [state]` - List tournaments in a state
`!stats` - Show overall tournament stats
        """,
        inline=False
    )
    
    embed.add_field(
        name="💡 Quick Tips",
        value="""
• Use partial names: `!tournament vegas` finds "Vegas Cup"
• Month names: `!tournaments January` or `!tournaments March`
• State abbreviations: `!state TX` or `!state LA`
        """,
        inline=False
    )
    
    await ctx.send(embed=embed)

@bot.command(name='tournament')
async def tournament_search(ctx, *, query):
    """Search for a tournament by name"""
    matches = [t for t in TOURNAMENTS if query.lower() in t['name'].lower()]
    
    if not matches:
        await ctx.send(f"❌ No tournaments found matching '{query}'")
        return
    
    t = matches[0]  # Show first match
    
    embed = discord.Embed(
        title=f"🏆 {t['name']}",
        description=f"{t['sport']} Tournament",
        color=0x00d4ff if t['sport'] == 'Soccer' else 0xff8c00
    )
    
    embed.add_field(name="📅 Dates", value=f"{t['month']} {t['startDate']} - {t['endDate'] or 'TBD'}", inline=True)
    embed.add_field(name="📍 Location", value=f"{t['state']}", inline=True)
    embed.add_field(name="👥 Size", value=f"{t['size'] or 'TBD'} teams", inline=True)
    embed.add_field(name="🔒 Status", value=t['status'] or 'TBD', inline=True)
    embed.add_field(name="👤 Crew", value=t['crew'] or 'Not assigned', inline=True)
    embed.add_field(name="💰 Kickback", value=t['kickback'] or 'N/A', inline=True)
    
    if t['website']:
        embed.add_field(name="🔗 Website", value=f"[Click here]({t['website']})", inline=False)
    
    if t['contact']:
        embed.add_field(name="📞 Contact", value=t['contact'], inline=False)
    
    if len(matches) > 1:
        embed.set_footer(text=f"Found {len(matches)} matches. Showing first result.")
    
    await ctx.send(embed=embed)

@bot.command(name='tournaments')
async def tournaments_by_month(ctx, month):
    """List tournaments by month"""
    month_map = {
        'jan': 'January', 'feb': 'Febuary', 'mar': 'March', 'apr': 'April',
        'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
        'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
    }
    
    # Normalize month input
    month_key = month.lower()[:3]
    full_month = month_map.get(month_key, month)
    
    matches = [t for t in TOURNAMENTS if t['month'].lower() == full_month.lower()]
    
    if not matches:
        await ctx.send(f"❌ No tournaments found for {full_month}")
        return
    
    # Group by sport
    soccer = [t for t in matches if t['sport'] == 'Soccer']
    baseball = [t for t in matches if t['sport'] == 'Baseball']
    
    embed = discord.Embed(
        title=f"📅 {full_month} 2026 Tournaments",
        description=f"Total: {len(matches)} tournaments",
        color=0x00d4ff
    )
    
    if soccer:
        soccer_list = "\n".join([f"• {t['name'][:50]} ({t['state']})" for t in soccer[:10]])
        if len(soccer) > 10:
            soccer_list += f"\n... and {len(soccer) - 10} more"
        embed.add_field(name=f"⚽ Soccer ({len(soccer)})", value=soccer_list or 'None', inline=False)
    
    if baseball:
        baseball_list = "\n".join([f"• {t['name'][:50]} ({t['state']})" for t in baseball[:10]])
        if len(baseball) > 10:
            baseball_list += f"\n... and {len(baseball) - 10} more"
        embed.add_field(name=f"⚾ Baseball ({len(baseball)})", value=baseball_list or 'None', inline=False)
    
    await ctx.send(embed=embed)

@bot.command(name='next')
async def upcoming_tournaments(ctx):
    """Show upcoming tournaments (next 30 days)"""
    # Simple implementation - show tournaments from current month
    current_month = datetime.now().strftime('%B')
    matches = [t for t in TOURNAMENTS if t['month'] == current_month]
    
    if not matches:
        await ctx.send("📅 No upcoming tournaments found for this month.")
        return
    
    embed = discord.Embed(
        title=f"📅 Upcoming Tournaments - {current_month} 2026",
        description=f"{len(matches)} tournaments this month",
        color=0x00ff88
    )
    
    for t in matches[:5]:
        status_emoji = "🔒" if t['status'] == 'LOCKED' else "⚠️" if t['status'] == 'NEED FILLED' else "📋"
        embed.add_field(
            name=f"{status_emoji} {t['name'][:60]}",
            value=f"{t['sport']} | {t['state']} | {t['startDate']}-{t['endDate'] or 'TBD'} | Crew: {t['crew'] or 'TBD'}",
            inline=False
        )
    
    if len(matches) > 5:
        embed.set_footer(text=f"... and {len(matches) - 5} more tournaments")
    
    await ctx.send(embed=embed)

@bot.command(name='locked')
async def locked_tournaments(ctx):
    """Show all locked tournaments"""
    matches = [t for t in TOURNAMENTS if t['status'] == 'LOCKED']
    
    embed = discord.Embed(
        title="🔒 Locked Tournaments",
        description=f"{len(matches)} confirmed tournaments",
        color=0x00ff88
    )
    
    for t in matches[:10]:
        embed.add_field(
            name=f"{t['name'][:60]}",
            value=f"{t['month']} {t['startDate']} | {t['state']} | Crew: {t['crew'] or 'TBD'}",
            inline=False
        )
    
    if len(matches) > 10:
        embed.set_footer(text=f"... and {len(matches) - 10} more")
    
    await ctx.send(embed=embed)

@bot.command(name='needfilled')
async def need_filled(ctx):
    """Show tournaments needing crew"""
    matches = [t for t in TOURNAMENTS if t['status'] == 'NEED FILLED']
    
    if not matches:
        await ctx.send("✅ All tournaments have crew assigned!")
        return
    
    embed = discord.Embed(
        title="⚠️ Tournaments Needing Crew",
        description=f"{len(matches)} tournaments need crew",
        color=0xff4444
    )
    
    for t in matches:
        embed.add_field(
            name=f"{t['name'][:60]}",
            value=f"{t['month']} {t['startDate']} | {t['state']} | Contact: {t['contact'] or 'N/A'}",
            inline=False
        )
    
    await ctx.send(embed=embed)

@bot.command(name='crew')
async def crew_info(ctx, *, name):
    """Show crew member assignments"""
    matches = [t for t in TOURNAMENTS if name.lower() in t['crew'].lower()]
    
    if not matches:
        await ctx.send(f"❌ No tournaments found for crew member '{name}'")
        return
    
    embed = discord.Embed(
        title=f"👤 {name.title()} - Tournament Assignments",
        description=f"{len(matches)} tournaments assigned",
        color=0x00d4ff
    )
    
    for t in matches[:10]:
        embed.add_field(
            name=f"{t['name'][:50]}",
            value=f"{t['month']} {t['startDate']} | {t['state']} | {t['status']}",
            inline=False
        )
    
    if len(matches) > 10:
        embed.set_footer(text=f"... and {len(matches) - 10} more")
    
    await ctx.send(embed=embed)

@bot.command(name='state')
async def state_tournaments(ctx, state_code):
    """List tournaments in a state"""
    matches = [t for t in TOURNAMENTS if state_code.upper() == t['state'].upper()]
    
    if not matches:
        await ctx.send(f"❌ No tournaments found in {state_code.upper()}")
        return
    
    embed = discord.Embed(
        title=f"📍 {state_code.upper()} Tournaments",
        description=f"{len(matches)} tournaments",
        color=0x00d4ff
    )
    
    for t in matches[:10]:
        embed.add_field(
            name=f"{t['name'][:50]}",
            value=f"{t['sport']} | {t['month']} {t['startDate']} | {t['status']}",
            inline=False
        )
    
    if len(matches) > 10:
        embed.set_footer(text=f"... and {len(matches) - 10} more")
    
    await ctx.send(embed=embed)

@bot.command(name='stats')
async def tournament_stats(ctx):
    """Show overall tournament statistics"""
    total = len(TOURNAMENTS)
    soccer = len([t for t in TOURNAMENTS if t['sport'] == 'Soccer'])
    baseball = len([t for t in TOURNAMENTS if t['sport'] == 'Baseball'])
    locked = len([t for t in TOURNAMENTS if t['status'] == 'LOCKED'])
    need_filled = len([t for t in TOURNAMENTS if t['status'] == 'NEED FILLED'])
    
    embed = discord.Embed(
        title="📊 2026 Tournament Statistics",
        description="Future Stars Sports Merch",
        color=0x00d4ff
    )
    
    embed.add_field(name="🏆 Total Tournaments", value=str(total), inline=True)
    embed.add_field(name="⚽ Soccer", value=str(soccer), inline=True)
    embed.add_field(name="⚾ Baseball", value=str(baseball), inline=True)
    embed.add_field(name="🔒 Locked", value=str(locked), inline=True)
    embed.add_field(name="⚠️ Need Filled", value=str(need_filled), inline=True)
    embed.add_field(name="📋 TBD", value=str(total - locked - need_filled), inline=True)
    
    await ctx.send(embed=embed)

@bot.command(name='packing')
async def packing_list(ctx, *, tournament_name):
    """Generate packing list for a tournament"""
    matches = [t for t in TOURNAMENTS if tournament_name.lower() in t['name'].lower()]
    
    if not matches:
        await ctx.send(f"❌ Tournament '{tournament_name}' not found")
        return
    
    t = matches[0]
    
    # Calculate packing needs
    try:
        size = int(t['size']) if t['size'] else 50
    except:
        size = 50
    
    # Jersey distribution
    soccer_jerseys = size * 15 if t['sport'] == 'Soccer' else 0
    baseball_jerseys = size * 15 if t['sport'] == 'Baseball' else 0
    
    embed = discord.Embed(
        title=f"📦 Packing List: {t['name']}",
        description=f"{t['sport']} | {t['state']} | {t['month']} {t['startDate']}-{t['endDate'] or 'TBD'}",
        color=0x00ff88
    )
    
    embed.add_field(
        name="👕 Jersey Needs",
        value=f"""
• Total teams: ~{size}
• Estimated players: ~{size * 15}
• {t['sport']} jerseys needed: ~{soccer_jerseys + baseball_jerseys}
• Buffer (10%): ~{int((soccer_jerseys + baseball_jerseys) * 0.1)}
        """,
        inline=False
    )
    
    embed.add_field(
        name="📦 Recommended Pack",
        value=f"""
• Ronaldo jerseys: ~{int((soccer_jerseys + baseball_jerseys) * 0.3)}
• Yamal jerseys: ~{int((soccer_jerseys + baseball_jerseys) * 0.4)}
• Mbappe jerseys: ~{int((soccer_jerseys + baseball_jerseys) * 0.15)}
• Messi jerseys: ~{int((soccer_jerseys + baseball_jerseys) * 0.1)}
• Other jerseys: ~{int((soccer_jerseys + baseball_jerseys) * 0.05)}
        """,
        inline=False
    )
    
    embed.add_field(
        name="📐 Size Distribution",
        value="""
• Youth YXXS-YXL: 60%
• Adult S-XL: 40%
        """,
        inline=False
    )
    
    embed.set_footer(text="Use !calculator for detailed packing calculations")
    
    await ctx.send(embed=embed)

@bot.command(name='inventory')
async def inventory_check(ctx):
    """Check current inventory levels"""
    embed = discord.Embed(
        title="📦 Current Inventory",
        description="Future Stars Sports Merch Stock",
        color=0x00d4ff
    )
    
    embed.add_field(
        name="⚽ Soccer Jerseys",
        value="""
• Ronaldo: 2,122 total (5 variants)
• Yamal: 2,070 total (9 variants)
• Mbappe: 151 total (2 variants)
• Messi: 2,500 total
• Other: 1,281 total
        """,
        inline=False
    )
    
    embed.add_field(
        name="⚾ Baseball Jerseys",
        value="""
• Total: 6,877
• Tournament stock: 17,736
        """,
        inline=False
    )
    
    embed.add_field(
        name="💰 Pricing",
        value="""
• Single jersey: $60
• 2 for $100 (save $20)
• Youth sizes: 18-28 (YXXS-YXL)
• Adult sizes: S-XL
        """,
        inline=False
    )
    
    await ctx.send(embed=embed)

@bot.command(name='jerseys')
async def jersey_stock(ctx, jersey_type):
    """Check specific jersey stock"""
    stock = {
        'ronaldo': {'total': 2122, 'variants': 5, 'top': 'Ronaldo Red (355)'},
        'yamal': {'total': 2070, 'variants': 9, 'top': 'Yamal Flower (435)'},
        'mbappe': {'total': 151, 'variants': 2, 'top': 'Mbappe Orange (77)'},
        'messi': {'total': 2500, 'variants': 1, 'top': 'Messi Jerseys (2500)'}
    }
    
    data = stock.get(jersey_type.lower())
    if not data:
        await ctx.send("❌ Jersey type not found. Try: ronaldo, yamal, mbappe, messi")
        return
    
    embed = discord.Embed(
        title=f"👕 {jersey_type.title()} Jersey Stock",
        color=0x00d4ff
    )
    
    embed.add_field(name="Total Stock", value=str(data['total']), inline=True)
    embed.add_field(name="Variants", value=str(data['variants']), inline=True)
    embed.add_field(name="Top Seller", value=data['top'], inline=True)
    
    status = "✅ Good" if data['total'] > 500 else "⚠️ Low" if data['total'] > 100 else "❌ Critical"
    embed.add_field(name="Status", value=status, inline=False)
    
    await ctx.send(embed=embed)

@bot.command(name='setup_channels')
@commands.has_permissions(manage_channels=True)
async def setup_channels(ctx):
    """Auto-create server channels for FS Sports Merch"""
    guild = ctx.guild
    
    # Define categories and channels
    setup = {
        '📋 INFO': ['welcome', 'announcements'],
        '🏆 TOURNAMENTS': ['upcoming', 'locked', 'need-filled'],
        '📦 INVENTORY': ['stock-alerts', 'sortly-updates'],
        '🚐 LOGISTICS': ['hotels', 'vehicles', 'crew-assignments']
    }
    
    created = []
    
    for category_name, channels in setup.items():
        # Create category
        category = await guild.create_category(category_name)
        created.append(f"📁 {category_name}")
        
        # Create channels in category
        for channel_name in channels:
            await guild.create_text_channel(channel_name, category=category)
            created.append(f"  └─ #{channel_name}")
    
    # Send summary
    embed = discord.Embed(
        title="✅ Channels Created",
        description="\n".join(created),
        color=0x00ff88
    )
    embed.set_footer(text="Future Stars Sports Merch - Server Setup")
    await ctx.send(embed=embed)

@setup_channels.error
async def setup_channels_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("❌ You need 'Manage Channels' permission to use this command.")

# Error handling
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        await ctx.send("❌ Command not found. Type `!help_fs` for available commands.")
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"❌ Missing argument. Usage: `{COMMAND_PREFIX}{ctx.command.name} [argument]`")
    else:
        await ctx.send(f"❌ Error: {str(error)}")

# Run the bot
if __name__ == '__main__':
    if TOKEN == 'YOUR_BOT_TOKEN_HERE':
        print("⚠️  Please set your Discord bot token!")
        print("Get one at: https://discord.com/developers/applications")
        print("Set it as environment variable: DISCORD_BOT_TOKEN")
    else:
        bot.run(TOKEN)
