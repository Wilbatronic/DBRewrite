import { OrderStatus } from "@prisma/client";
import { db } from "../../../database/database";
import { generateOrderId, getClaimedOrder, hasActiveOrder, matchActiveOrder, matchOrderStatus } from "../../../database/order";
import { client } from "../../../providers/client";
import { config, text } from "../../../providers/config";
import { mainGuild } from "../../../providers/discord";
import { permissions } from "../../../providers/permissions";
import { Command } from "../../../structures/Command";
import { format } from "../../../utils/string";

export const command = new Command("unclaim", "Unclaims an order.")
	.addPermission(permissions.employee)
	.addOption("string", o => o.setRequired(true).setName("order").setDescription("The order to Unclaim."))
	.setExecutor(async int => {
		if (await getClaimedOrder(int.user)) {
			await int.reply(text.commands.claim.existing);
			return;
		}
		const match = int.options.getString("order", true); 
		const order = await matchOrderStatus(match, OrderStatus.Unprepared);
		if (order === null) {
			await int.reply(text.common.invalidOrderId);
			return;
		}
		if (order.user === int.user.id && !permissions.developer.hasPermission(int.user)) {
			await int.reply(text.common.interactOwn);
			return;
		}
		await db.order.update({ where: { id: order.id }, data: { claimer: null, status: OrderStatus.Preparing } });
		await int.reply(text.commands.claim.success);
	});
