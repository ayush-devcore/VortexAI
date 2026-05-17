const memberService = require('../services/memberService');

const list = async (req, res, next) => {
  try {
    const members = await memberService.listMembers(req.params.workspaceId, req.user.id);
    res.json({ success: true, data: members });
  } catch (e) {
    next(e);
  }
};

const invite = async (req, res, next) => {
  try {
    const member = await memberService.inviteMember(req.params.workspaceId, req.user.id, req.body);
    res.status(201).json({ success: true, data: member });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await memberService.removeMember(
      req.params.workspaceId,
      req.user.id,
      req.params.userId
    );
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
};

module.exports = { list, invite, remove };
