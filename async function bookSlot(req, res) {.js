async function bookSlot(req, res) {
  const { userId, slotId } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const slot = await TimeSlot.findOne({
      where: { id: slotId, is_available: true },
      lock: true,
      transaction
    });

    if (!slot) {
      await transaction.rollback();
      return res.status(400).json({ message: "Slot not available" });
    }

    slot.is_available = false;
    await slot.save({ transaction });

    const booking = await Booking.create({
      user_id: userId,
      slot_id: slotId,
      status: "confirmed",
      payment_status: "paid"
    }, { transaction });

    await transaction.commit();

    res.json({ message: "Booking successful", booking });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
}