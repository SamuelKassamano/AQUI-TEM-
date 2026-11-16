import asyncio
import edge_tts

# Fluent, natural, engaging e-commerce welcome text without awkward pauses
# Using exact words requested by user:
# "Olá! Seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos electrónicos, electrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras! Estamos aqui para ajudar no que precisar"
TEXT_PT = "Olá, seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos eletrónicos, eletrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras, estamos aqui para ajudar no que precisar!"

TEXT_EN = "Hello, welcome to our store! It is a pleasure to have you here. Explore our wide range of electronics, home appliances, and gadgets. We wish you an excellent experience and happy shopping, we are here to help whenever you need!"

async def generate():
    print("Generating engaging Portuguese audio with Francisca...")
    # Francisca: warm, lively, continuous flow without dead pauses
    c_pt = edge_tts.Communicate(TEXT_PT, "pt-BR-FranciscaNeural", rate="+4%", pitch="+1Hz")
    await c_pt.save("public/audio/welcome_pt.mp3")
    print("Saved public/audio/welcome_pt.mp3")

    print("Generating engaging English audio with Jenny...")
    c_en = edge_tts.Communicate(TEXT_EN, "en-US-JennyNeural", rate="+3%", pitch="+1Hz")
    await c_en.save("public/audio/welcome_en.mp3")
    print("Saved public/audio/welcome_en.mp3")

if __name__ == "__main__":
    asyncio.run(generate())
