import Joi from 'joi';

const adminParams = {
  //DELETE admin/delete/:userId
  deleteUser: {
    params: {
      userId: Joi.string().required()
    }
  },

  //POST admin/createTopic
  createTopic: {
    body: {
      name: Joi.string().required(),
      image: Joi.string().required(),
      level: Joi.number().required(),
      levelName: Joi.string(),
      rowNo: Joi.number(),
      position: Joi.string().valid('right', 'left', 'center'),
      prompt: Joi.array().items({
        text: Joi.string().valid('text', 'image', 'audio'),
        value: Joi.string()
      })
    }
  },

  //PUT admin/updateTopic/:topicId
  updateTopic: {
    params: {
      topicId: Joi.string().required(),
    },
    body: {
      name: Joi.string(),
      image: Joi.string(),
      level: Joi.number(),
      levelName: Joi.string(),
      rowNo: Joi.number(),
      position: Joi.string().valid('right', 'left', 'center'),
      prompt: Joi.array().items({
        text: Joi.string().valid('text', 'image', 'audio'),
        value: Joi.string()
      })
    }
  },

  //DELETE admin/deleteTopic/:topicId
  deleteTopic: {
    params: {
      topicId: Joi.string().required()
    }
  },

  //POST admin/createQuestion
  createQuestion: {
    body: {
      title: Joi.string().required(),
      image: Joi.string(),
      audio: Joi.string(),
      type: Joi.string().required().valid('MCQ', 'MCQ (Audio)', 'MCQ (Image)', 'Ranking', 'Ranking (Audio)', 'Fill in the blanks', 'Tapping Rhythm', 'Mix and Match'),
      answer: Joi.array().items(Joi.string()),
      options: Joi.array().items({
        option: Joi.string().required(),
        prompt: Joi.array().items({
          type: Joi.string().valid('text', 'image', 'audio'),
          value: Joi.string()
        }),
        correctAnswer: Joi.boolean(),
        audioName: Joi.string(),
        matchOption: Joi.string(),
        imageName: Joi.string()
      }),
      questionTitle: Joi.string().required(),
      composerName: Joi.string(),
      topicId: Joi.string().required()
    }
  },

  //GET admin/listTopic
  listQuestions: {
    query: {
      topicId: Joi.string().required()
    }
  },

  //PUT admin/updateQuestion/:questionId
  updateQuestion: {
    params: {
      questionId: Joi.string().required()
    },
    body: {
      title: Joi.string(),
      image: Joi.string(),
      audio: Joi.string(),
      type: Joi.string().valid('MCQ', 'MCQ (Audio)', 'MCQ (Image)', 'Ranking', 'Ranking (Audio)', 'Fill in the blanks', 'Tapping Rhythm', 'Mix and Match'),
      answer: Joi.array().items(Joi.string()),
      options: Joi.array().items({
        option: Joi.string().required(),
        prompt: Joi.array().items({
          type: Joi.string().valid('text', 'image', 'audio'),
          value: Joi.string()
        }),
        correctAnswer: Joi.boolean(),
        audioName: Joi.string(),
        matchOption: Joi.string(),
        imageName: Joi.string()
      }),
      questionTitle: Joi.string(),
      composerName: Joi.string(),
      topicId: Joi.string()
    }
  },

  //DELETE admin/deleteQuestion/:questionId
  deleteQuestion: {
    params: {
      questionId: Joi.string().required()
    }
  },

  //GET admin/getQuestionById/:questionId
  getQuestionById: {
    params: {
      questionId: Joi.string().required()
    }
  },

  //DELETE admin/deleteFeedback/:feedbackId
  deleteFeedback: {
    params: {
      feedbackId: Joi.string().required()
    }
  },

  //POST admin/createHint
  createHint: {
    body: {
      hintInfo: Joi.array().items({
        type: Joi.string().valid('text', 'image', 'audio'),
        value: Joi.string()
      }),
      questionId: Joi.string()
    }
  },

  //PUT admin/updateHint/:hintId
  updateHint: {
    params: {
      hintId: Joi.string().required()
    },
    body: {
      hintInfo: Joi.array().items({
        type: Joi.string().valid('text', 'image', 'audio'),
        value: Joi.string()
      }),
      questionId: Joi.string()
    }
  },

  //DELETE admin/deleteHint/:hintId
  deleteHint: {
    params: {
      hintId: Joi.string().required()
    }
  },

  //GET listHint/:questionId
  listHint: {
    params: {
      questionId: Joi.string().required()
    }
  }
}

module.exports = adminParams;