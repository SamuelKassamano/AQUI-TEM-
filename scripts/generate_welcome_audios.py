import asyncio
import os
import edge_tts

TEXT_PT = "Olá! Seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos electrónicos, electrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras! Estamos aqui para ajudar no que precisar."
TEXT_EN = "Hello! Welcome to our store! It's a pleasure to have you here. Explore our wide range of electronics, home appliances, and gadgets. We wish you an excellent experience and happy shopping! We are here to help whenever you need."

# Portuguese female neural voice: pt-PT-RaquelNeural or pt-BR-FranciscaNeural
VOICE_PT = "pt-PT-RaquelNeural" 
VOICE_EN = "en-US-JennyNeural"

async def generate():
    os.makedirs("public/audio", exist_ok=True)
    
    print("Generating Portuguese female welcome audio...")
    communicate_pt = edge_tts.Communicate(TEXT_PT, VOICE_PT, rate="-2%", pitch="+1Hz")
    await communicate_pt.save("public/audio/welcome_pt.mp3")
    print("Saved public/audio/welcome_pt.mp3")

    print("Generating English female welcome audio...")
    communicate_en = edge_tts.Communicate(TEXT_EN, VOICE_EN, rate="-2%", pitch="+1Hz")
    await communicate_en.save("public/audio/welcome_en.mp3")
    print("Saved public/audio/welcome_en.mp3")

if __name__ == "__main__":
    asyncio.run(generate())
